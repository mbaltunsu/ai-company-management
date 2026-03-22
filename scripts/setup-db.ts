/**
 * Database Setup Script
 *
 * Usage: npx tsx scripts/setup-db.ts
 *
 * Reads .env.local for Supabase credentials and creates all tables,
 * indexes, and triggers via the Supabase SQL API.
 */

import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found. Create it from .env.example first.");
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf-8");

async function runSetup() {
  console.log("🔧 Setting up database schema...\n");
  console.log(`   Supabase URL: ${supabaseUrl!.replace(/\/\/(.{8}).*(.{10})\./, "//$1•••$2.")}`);

  // Execute the full schema as a single SQL block via Supabase's HTTP SQL endpoint
  // This endpoint is available at /sql and accepts service_role authorization
  const sqlEndpoint = `${supabaseUrl}/sql`;

  const res = await fetch(sqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: schemaSql }),
  });

  if (res.ok) {
    console.log("\n   ✅ All tables, indexes, and triggers created successfully!\n");
    console.log("   Created:");
    console.log("   • projects — registered project registry");
    console.log("   • goals — project goals with progress tracking");
    console.log("   • activity_log — cached activity for dashboard");
    console.log("   • app_settings — key-value settings store");
    console.log("   • 5 indexes for query performance");
    console.log("   • 3 updated_at triggers");
    console.log("\n✅ Database is ready! Run: npm run dev\n");
    return;
  }

  // If /sql endpoint doesn't work, try via PostgREST rpc
  const errorText = await res.text();

  // Fallback: try individual statements via PostgREST
  console.log(`\n   ⚠️  SQL endpoint returned ${res.status}. Trying alternative method...\n`);

  // Create a helper function via PostgREST first
  const createHelperSql = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Try creating the helper via the SQL endpoint with different paths
  for (const endpoint of [`${supabaseUrl}/sql`, `${supabaseUrl}/pg`]) {
    const helperRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey!,
      },
      body: JSON.stringify({ query: createHelperSql }),
    });

    if (helperRes.ok) {
      // Now use rpc to execute the full schema
      const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey!,
        },
        body: JSON.stringify({ query: schemaSql }),
      });

      if (rpcRes.ok) {
        console.log("\n   ✅ Schema created successfully via RPC!\n");
        console.log("✅ Database is ready! Run: npm run dev\n");
        return;
      }
    }
  }

  // If all programmatic methods fail, show manual instructions
  console.log("   ❌ Could not execute SQL programmatically.\n");
  console.log("   This is likely because your Supabase plan doesn't expose the SQL endpoint.");
  console.log("   No worries — run the schema manually:\n");
  console.log("   Option 1: Supabase Dashboard SQL Editor");
  console.log(`   → Go to your Supabase project dashboard → SQL Editor`);
  console.log(`   → Paste the contents of supabase/schema.sql and run\n`);
  console.log("   Option 2: Supabase CLI");
  console.log("   → npm install -g supabase");
  console.log("   → supabase link --project-ref <your-project-ref>");
  console.log("   → supabase db push\n");
  console.log(`   SQL file: ${schemaPath}`);
  console.log(`   Error: ${errorText.slice(0, 200)}\n`);
  process.exit(1);
}

runSetup().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
