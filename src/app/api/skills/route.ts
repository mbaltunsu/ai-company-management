import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { createSkillSchema } from "@/lib/validators";
import type { ApiResult, Skill } from "@/types";

function mapRow(row: Record<string, unknown>): Skill {
  return {
    id: row.id as string,
    projectId: (row.project_id as string | null) ?? null,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    whenToUse: (row.when_to_use as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// GET /api/skills?projectId=<uuid>
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<Skill[]>>> {
  const log = createRequestLogger("GET /api/skills");

  const projectId = request.nextUrl.searchParams.get("projectId");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      log.error({ err: error }, "Supabase query failed");
      return NextResponse.json(
        { data: null, error: "Failed to fetch skills" },
        { status: 500 }
      );
    }

    const skills: Skill[] = (data ?? []).map((row) =>
      mapRow(row as Record<string, unknown>)
    );
    log.info({ count: skills.length, projectId }, "Skills fetched");

    return NextResponse.json({ data: skills, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching skills");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/skills
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<Skill>>> {
  const log = createRequestLogger("POST /api/skills");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn("Failed to parse request body");
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = createSkillSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { projectId, name, description, whenToUse } = parsed.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("skills")
      .insert({
        project_id: projectId ?? null,
        name,
        description: description ?? null,
        when_to_use: whenToUse ?? null,
      })
      .select()
      .single();

    if (error) {
      log.error({ err: error }, "Failed to insert skill");
      return NextResponse.json(
        { data: null, error: "Failed to create skill" },
        { status: 500 }
      );
    }

    const skill = mapRow(data as Record<string, unknown>);
    log.info({ skillId: skill.id, projectId }, "Skill created");

    return NextResponse.json({ data: skill, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Unexpected error creating skill");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
