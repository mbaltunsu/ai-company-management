import { NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";
import { testConnection } from "@/lib/claude";
import type { ApiResult } from "@/types";

// GET /api/claude/test
export async function GET(): Promise<
  NextResponse<ApiResult<{ connected: boolean }>>
> {
  const log = createRequestLogger("GET /api/claude/test");

  log.info("Claude connection test requested");

  try {
    const connected = await testConnection();
    log.info({ connected }, "Claude connection test completed");
    return NextResponse.json({ data: { connected }, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error during connection test");
    return NextResponse.json(
      { data: { connected: false }, error: null }
    );
  }
}
