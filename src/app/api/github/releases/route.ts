import { NextRequest, NextResponse } from "next/server";
import { createGitHubService } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";

const log = createRequestLogger("GET /api/github/releases");

export async function GET(request: NextRequest) {
  try {
    const repo = request.nextUrl.searchParams.get("repo");
    if (!repo) {
      return NextResponse.json(
        { data: null, error: "repo query parameter is required" },
        { status: 400 }
      );
    }

    const github = createGitHubService();
    if (!github) {
      return NextResponse.json(
        { data: null, error: "GitHub credentials not configured" },
        { status: 503 }
      );
    }

    const releases = await github.getReleases(repo);
    log.info({ repo, count: releases.length }, "Releases fetched");

    return NextResponse.json({ data: releases, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch releases");
    return NextResponse.json(
      { data: null, error: "Failed to fetch releases" },
      { status: 500 }
    );
  }
}
