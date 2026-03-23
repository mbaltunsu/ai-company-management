import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { updateTaskSchema } from "@/lib/validators";
import type { ApiResult, Task } from "@/types";

function mapRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    projectId: (row.project_id as string | null) ?? null,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    status: (row.status as Task["status"]) ?? "backlog",
    assignedAgents: (row.assigned_agents as string[]) ?? [],
    suggestedPrompt: (row.suggested_prompt as string | null) ?? null,
    priority: (row.priority as Task["priority"]) ?? "normal",
    order: (row.order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Task>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`GET /api/tasks/${id}`);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      log.warn({ id }, "Task not found");
      return NextResponse.json(
        { data: null, error: "Task not found" },
        { status: 404 }
      );
    }

    log.info({ id }, "Task fetched");
    return NextResponse.json({
      data: mapRow(data as Record<string, unknown>),
      error: null,
    });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching task");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Task>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`PATCH /api/tasks/${id}`);

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

  const parsed = updateTaskSchema.safeParse(body);
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
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
  if (parsed.data.assignedAgents !== undefined) updates.assigned_agents = parsed.data.assignedAgents;
  if (parsed.data.suggestedPrompt !== undefined) updates.suggested_prompt = parsed.data.suggestedPrompt;
  if (parsed.data.order !== undefined) updates.order = parsed.data.order;
  updates.updated_at = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      log.error({ err: error, id }, "Failed to update task");
      return NextResponse.json(
        { data: null, error: "Failed to update task" },
        { status: 500 }
      );
    }

    const task = mapRow(data as Record<string, unknown>);
    log.info({ id, updates: Object.keys(updates) }, "Task updated");

    return NextResponse.json({ data: task, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error updating task");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<{ deleted: true }>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`DELETE /api/tasks/${id}`);

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete task");
      return NextResponse.json(
        { data: null, error: "Failed to delete task" },
        { status: 500 }
      );
    }

    log.info({ id }, "Task deleted");
    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error deleting task");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
