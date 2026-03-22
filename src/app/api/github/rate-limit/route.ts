import { NextResponse } from "next/server";
import { createGitHubService } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";

const log = createRequestLogger("GET /api/github/rate-limit");

export async function GET() {
  try {
    const github = createGitHubService();
    if (!github) {
      return NextResponse.json(
        { data: null, error: "GitHub credentials not configured" },
        { status: 503 }
      );
    }

    const rateLimit = await github.getRateLimit();
    log.info({ remaining: rateLimit.remaining }, "Rate limit checked");

    return NextResponse.json({ data: rateLimit, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch rate limit");
    return NextResponse.json(
      { data: null, error: "Failed to fetch rate limit" },
      { status: 500 }
    );
  }
}
