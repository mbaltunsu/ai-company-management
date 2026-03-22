/**
 * Database Setup Script
 *
 * Usage: npx tsx scripts/setup-db.ts
 *
 * Executes supabase/schema.sql against your Supabase database
 * using the PostgREST RPC method (creates a helper function first).
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

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
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// Individual table creation statements (executed via supabase-js insert/select)
async function runSetup() {
  console.log("🔧 Setting up database schema...\n");
  console.log(`   URL: ${supabaseUrl!.replace(/\/\/(.{8}).*(.{10})\./, "//$1•••$2.")}\n`);

  // Step 1: Test connection
  console.log("   Testing connection...");
  const { error: pingError } = await supabase.from("projects").select("id").limit(0);

  if (pingError && !pingError.message.includes("does not exist")) {
    console.error(`   ❌ Connection failed: ${pingError.message}`);
    process.exit(1);
  }

  if (!pingError) {
    // Tables already exist — check all of them
    console.log("   ✅ Connection OK — checking tables...\n");

    const tables = ["projects", "goals", "activity_log", "app_settings"];
    let allExist = true;

    for (const table of tables) {
      const { error } = await supabase.from(table).select("*").limit(0);
      if (error) {
        console.log(`   ❌ ${table}: missing`);
        allExist = false;
      } else {
        console.log(`   ✅ ${table}: exists`);
      }
    }

    if (allExist) {
      console.log("\n✅ All tables exist! Database is ready.\n");
      console.log("   Run: npm run dev\n");
      return;
    }

    console.log("\n   Some tables are missing. Run the schema SQL manually:");
  } else {
    console.log("   ℹ️  Tables don't exist yet. Creating them...\n");
  }

  // Step 2: Try to create tables via the Supabase Management API
  // Extract project ref from URL
  const projectRef = supabaseUrl!.replace("https://", "").replace(".supabase.co", "");

  // Try the v1 query endpoint
  const queryEndpoint = `https://${projectRef}.supabase.co/rest/v1/`;
  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  // Try using the Supabase Management API (requires access token, not service role)
  // Since we can't reliably execute DDL via PostgREST, provide clear manual instructions

  console.log("   ─────────────────────────────────────────────");
  console.log("   Supabase doesn't allow DDL via PostgREST API.");
  console.log("   Run the schema using ONE of these methods:\n");

  console.log("   📋 Method 1: SQL Editor (easiest)");
  console.log(`   → Open: https://supabase.com/dashboard/project/${projectRef}/sql`);
  console.log("   → Click 'New Query'");
  console.log(`   → Paste contents of: supabase/schema.sql`);
  console.log("   → Click 'Run'\n");

  console.log("   💻 Method 2: Supabase CLI");
  console.log("   → npx supabase login");
  console.log(`   → npx supabase link --project-ref ${projectRef}`);
  console.log("   → npx supabase db push\n");

  console.log("   📎 Method 3: Copy SQL to clipboard now");

  // Copy to clipboard on Windows
  try {
    const { execSync } = await import("child_process");
    execSync("clip", { input: schemaSql });
    console.log("   ✅ Schema SQL copied to clipboard!");
    console.log(`   → Go to: https://supabase.com/dashboard/project/${projectRef}/sql`);
    console.log("   → Paste and run\n");
  } catch {
    console.log(`   → Open: ${schemaPath}`);
    console.log("   → Copy the contents and paste in SQL Editor\n");
  }

  console.log("   After running the SQL, run this script again to verify.");
  console.log("   ─────────────────────────────────────────────\n");
}

runSetup().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
