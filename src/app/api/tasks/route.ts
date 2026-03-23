import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { createTaskSchema } from "@/lib/validators";
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

// GET /api/tasks?projectId=<uuid>
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<Task[]>>> {
  const log = createRequestLogger("GET /api/tasks");

  const projectId = request.nextUrl.searchParams.get("projectId");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("tasks")
      .select("*")
      .order("status", { ascending: true })
      .order("order", { ascending: true });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      log.error({ err: error }, "Supabase query failed");
      return NextResponse.json(
        { data: null, error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    const tasks: Task[] = (data ?? []).map(mapRow);
    log.info({ count: tasks.length, projectId }, "Tasks fetched");

    return NextResponse.json({ data: tasks, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching tasks");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<Task>>> {
  const log = createRequestLogger("POST /api/tasks");

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

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { projectId, title, description, status, priority, assignedAgents, suggestedPrompt } =
    parsed.data;

  try {
    const supabase = await createClient();

    // Determine order: place at end of the target status column
    const targetStatus = status ?? "backlog";
    const { count } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", targetStatus);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId ?? null,
        title,
        description: description ?? null,
        status: targetStatus,
        priority: priority ?? "normal",
        assigned_agents: assignedAgents ?? [],
        suggested_prompt: suggestedPrompt ?? null,
        order: count ?? 0,
      })
      .select()
      .single();

    if (error) {
      log.error({ err: error }, "Failed to insert task");
      return NextResponse.json(
        { data: null, error: "Failed to create task" },
        { status: 500 }
      );
    }

    const task = mapRow(data as Record<string, unknown>);
    log.info({ taskId: task.id, projectId }, "Task created");

    return NextResponse.json({ data: task, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Unexpected error creating task");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
