import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { updateGoalSchema } from "@/lib/validators";
import type { ApiResult, Goal } from "@/types";

function mapRow(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    progress: (row.progress as number) ?? 0,
    status: (row.status as Goal["status"]) ?? "active",
    dueDate: (row.due_date as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/goals/[id]
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Goal>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`GET /api/goals/${id}`);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      log.warn({ id }, "Goal not found");
      return NextResponse.json(
        { data: null, error: "Goal not found" },
        { status: 404 }
      );
    }

    log.info({ id }, "Goal fetched");
    return NextResponse.json({ data: mapRow(data as Record<string, unknown>), error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching goal");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/goals/[id]
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Goal>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`PATCH /api/goals/${id}`);

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

  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.progress !== undefined) updates.progress = parsed.data.progress;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.dueDate !== undefined) updates.due_date = parsed.data.dueDate;
  updates.updated_at = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      log.error({ err: error, id }, "Failed to update goal");
      return NextResponse.json(
        { data: null, error: "Failed to update goal" },
        { status: 500 }
      );
    }

    const goal = mapRow(data as Record<string, unknown>);
    log.info({ id, updates: Object.keys(updates) }, "Goal updated");

    return NextResponse.json({ data: goal, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error updating goal");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id]
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<{ deleted: true }>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`DELETE /api/goals/${id}`);

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete goal");
      return NextResponse.json(
        { data: null, error: "Failed to delete goal" },
        { status: 500 }
      );
    }

    log.info({ id }, "Goal deleted");
    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error deleting goal");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
