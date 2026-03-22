import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRequestLogger } from "@/lib/logger";

const log = createRequestLogger("POST /api/setup");

const TABLES = [
  {
    name: "projects",
    sql: `CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      github_repo TEXT,
      description TEXT,
      is_auto_discovered BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  },
  {
    name: "goals",
    sql: `CREATE TABLE IF NOT EXISTS goals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  },
  {
    name: "activity_log",
    sql: `CREATE TABLE IF NOT EXISTS activity_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('commit', 'issue', 'release', 'agent_change', 'branch')),
      title TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      occurred_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  },
  {
    name: "app_settings",
    sql: `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  },
];

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { data: null, error: "Missing Supabase credentials in environment" },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check which tables already exist by trying a simple query on each
    const results: { table: string; status: "exists" | "created" | "error"; error?: string }[] = [];

    for (const table of TABLES) {
      // Check if table exists
      const { error: checkError } = await supabase.from(table.name).select("*").limit(0);

      if (!checkError) {
        results.push({ table: table.name, status: "exists" });
        continue;
      }

      // Table doesn't exist — it needs to be created via SQL Editor
      results.push({
        table: table.name,
        status: "error",
        error: "Table does not exist. Create it via Supabase SQL Editor or run: npx tsx scripts/setup-db.ts",
      });
    }

    const missing = results.filter((r) => r.status === "error");
    const existing = results.filter((r) => r.status === "exists");

    log.info({ existing: existing.length, missing: missing.length }, "Schema check complete");

    if (missing.length === 0) {
      return NextResponse.json({
        data: {
          message: "All tables exist and are ready",
          tables: results,
        },
        error: null,
      });
    }

    return NextResponse.json({
      data: {
        message: `${existing.length} tables exist, ${missing.length} missing`,
        tables: results,
        setupInstructions: {
          option1: "Run: npx tsx scripts/setup-db.ts",
          option2: "Paste supabase/schema.sql in Supabase SQL Editor",
          option3: "Use Supabase CLI: supabase db push",
        },
      },
      error: null,
    });
  } catch (err) {
    log.error({ err }, "Schema check failed");
    return NextResponse.json(
      { data: null, error: "Schema check failed" },
      { status: 500 }
    );
  }
}
