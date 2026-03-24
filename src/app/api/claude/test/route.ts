import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";
import { testConnectionWithKey } from "@/lib/claude";
import type { ApiResult } from "@/types";

// POST /api/claude/test — test a given API key without saving it
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResult<{ connected: boolean; error?: string }>>> {
  const log = createRequestLogger("POST /api/claude/test");

  let body: { apiKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      data: { connected: false, error: "Invalid request body" },
      error: null,
    });
  }

  const apiKey = body.apiKey?.trim();
  if (!apiKey) {
    return NextResponse.json({
      data: { connected: false, error: "No API key provided" },
      error: null,
    });
  }

  log.info("Claude connection test requested");

  try {
    const result = await testConnectionWithKey(apiKey);
    log.info({ connected: result.connected, error: result.error }, "Claude connection test completed");
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error during connection test");
    return NextResponse.json({
      data: { connected: false, error: "Unexpected server error" },
      error: null,
    });
  }
}
