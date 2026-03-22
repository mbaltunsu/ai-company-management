import { NextRequest, NextResponse } from "next/server";
import { createGitHubService } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";
import { githubQuerySchema } from "@/lib/validators";

const log = createRequestLogger("GET /api/github/commits");

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = githubQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Validation failed", details: parsed.error.issues },
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

    const { repo, page, perPage } = parsed.data;
    const since = request.nextUrl.searchParams.get("since") || undefined;
    const until = request.nextUrl.searchParams.get("until") || undefined;

    const commits = await github.getCommits(repo, { since, until, page, perPage });
    log.info({ repo, count: commits.length }, "Commits fetched");

    return NextResponse.json({ data: commits, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch commits");
    return NextResponse.json(
      { data: null, error: "Failed to fetch commits" },
      { status: 500 }
    );
  }
}
