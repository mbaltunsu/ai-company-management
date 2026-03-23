import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { updateSkillSchema } from "@/lib/validators";
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

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/skills/[id]
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Skill>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`GET /api/skills/${id}`);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      log.warn({ id }, "Skill not found");
      return NextResponse.json(
        { data: null, error: "Skill not found" },
        { status: 404 }
      );
    }

    log.info({ id }, "Skill fetched");
    return NextResponse.json({
      data: mapRow(data as Record<string, unknown>),
      error: null,
    });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching skill");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/skills/[id]
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Skill>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`PATCH /api/skills/${id}`);

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

  const parsed = updateSkillSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;
  if (parsed.data.whenToUse !== undefined)
    updates.when_to_use = parsed.data.whenToUse;
  updates.updated_at = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("skills")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      log.error({ err: error, id }, "Failed to update skill");
      return NextResponse.json(
        { data: null, error: "Failed to update skill" },
        { status: 500 }
      );
    }

    const skill = mapRow(data as Record<string, unknown>);
    log.info({ id, updates: Object.keys(updates) }, "Skill updated");

    return NextResponse.json({ data: skill, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error updating skill");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[id]
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<{ deleted: true }>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`DELETE /api/skills/${id}`);

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("skills").delete().eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete skill");
      return NextResponse.json(
        { data: null, error: "Failed to delete skill" },
        { status: 500 }
      );
    }

    log.info({ id }, "Skill deleted");
    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error deleting skill");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
