import { NextRequest, NextResponse } from "next/server";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";
import { auth } from "@/lib/auth";

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

    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { data: null, error: "GitHub not connected" },
        { status: 401 }
      );
    }

    const github = createGitHubServiceFromSession(session);
    if (!github) {
      return NextResponse.json(
        { data: null, error: "GitHub not connected" },
        { status: 401 }
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
