import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";

const log = createRequestLogger("GET /api/github/repos");

export async function GET(request: NextRequest) {
  try {
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
        { data: null, error: "Failed to create GitHub service" },
        { status: 500 }
      );
    }

    const search = request.nextUrl.searchParams.get("search") || "";
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const perPage = parseInt(request.nextUrl.searchParams.get("perPage") || "30");

    let repos;
    if (search.trim()) {
      repos = await github.searchUserRepositories(search.trim());
    } else {
      repos = await github.listUserRepositories({ page, perPage, sort: "updated" });
    }

    log.info({ count: repos.length, search: search || undefined }, "Repos fetched");
    return NextResponse.json({ data: repos, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch repos");
    return NextResponse.json(
      { data: null, error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
