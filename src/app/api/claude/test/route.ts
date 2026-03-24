import { NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";
import { testConnection } from "@/lib/claude";
import type { ApiResult } from "@/types";

// GET /api/claude/test
export async function GET(): Promise<
  NextResponse<ApiResult<{ connected: boolean; error?: string }>>
> {
  const log = createRequestLogger("GET /api/claude/test");

  log.info("Claude connection test requested");

  try {
    const result = await testConnection();
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
