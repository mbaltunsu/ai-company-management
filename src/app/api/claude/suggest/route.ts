import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";
import { claudeSuggestSchema } from "@/lib/validators";
import { generateTaskSuggestion } from "@/lib/claude";
import type { ApiResult, ClaudeSuggestion } from "@/types";

// POST /api/claude/suggest
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<ClaudeSuggestion>>> {
  const log = createRequestLogger("POST /api/claude/suggest");

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

  const parsed = claudeSuggestSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { taskTitle, taskDescription, availableAgents } = parsed.data;

  log.info({ taskTitle }, "Claude suggest request received");

  try {
    const result = await generateTaskSuggestion(
      taskTitle,
      taskDescription,
      availableAgents
    );

    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error({ err }, "Failed to generate suggestion");

    if (message === "Claude API key not configured") {
      return NextResponse.json(
        { data: null, error: "Claude API key not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { data: null, error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
