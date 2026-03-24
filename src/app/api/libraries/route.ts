import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { createLibrarySchema } from "@/lib/validators";
import type { AgentLibrary, ApiResult } from "@/types";

function mapRow(row: Record<string, unknown>): AgentLibrary {
  return {
    id: row.id as string,
    name: row.name as string,
    repo: row.repo as string,
    description: (row.description as string | null) ?? null,
    isDefault: (row.is_default as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// GET /api/libraries — list all agent libraries
export async function GET(): Promise<NextResponse<ApiResult<AgentLibrary[]>>> {
  const log = createRequestLogger("GET /api/libraries");

  try {
    log.info("Fetching all agent libraries");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agent_libraries")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      log.error({ err: error }, "Supabase query failed");
      return NextResponse.json(
        { data: null, error: "Failed to fetch libraries" },
        { status: 500 }
      );
    }

    const libraries: AgentLibrary[] = (data ?? []).map((row) =>
      mapRow(row as Record<string, unknown>)
    );

    log.info({ count: libraries.length }, "Libraries fetched successfully");
    return NextResponse.json({ data: libraries, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching libraries");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/libraries — create a new agent library
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<AgentLibrary>>> {
  const log = createRequestLogger("POST /api/libraries");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn("Failed to parse request body as JSON");
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = createLibrarySchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, repo, description } = parsed.data;

  try {
    log.info({ name, repo }, "Creating agent library");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agent_libraries")
      .insert({
        name,
        repo,
        description: description ?? null,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      log.error({ err: error, name, repo }, "Failed to insert library");
      if (error.code === "23505") {
        return NextResponse.json(
          { data: null, error: "A library with this repo already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { data: null, error: "Failed to create library" },
        { status: 500 }
      );
    }

    const library = mapRow(data as Record<string, unknown>);
    log.info({ id: library.id, repo }, "Library created successfully");
    return NextResponse.json({ data: library, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Unexpected error creating library");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
