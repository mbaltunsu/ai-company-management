import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { createGoalSchema } from "@/lib/validators";
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

// GET /api/goals?projectId=<uuid>
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<Goal[]>>> {
  const log = createRequestLogger("GET /api/goals");

  const projectId = request.nextUrl.searchParams.get("projectId");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      log.error({ err: error }, "Supabase query failed");
      return NextResponse.json(
        { data: null, error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    const goals: Goal[] = (data ?? []).map(mapRow);
    log.info({ count: goals.length, projectId }, "Goals fetched");

    return NextResponse.json({ data: goals, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching goals");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/goals
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<Goal>>> {
  const log = createRequestLogger("POST /api/goals");

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

  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { projectId, title, description, dueDate } = parsed.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("goals")
      .insert({
        project_id: projectId,
        title,
        description: description ?? null,
        due_date: dueDate ?? null,
        progress: 0,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      log.error({ err: error }, "Failed to insert goal");
      return NextResponse.json(
        { data: null, error: "Failed to create goal" },
        { status: 500 }
      );
    }

    const goal = mapRow(data as Record<string, unknown>);
    log.info({ goalId: goal.id, projectId }, "Goal created");

    return NextResponse.json({ data: goal, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Unexpected error creating goal");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
