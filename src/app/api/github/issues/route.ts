import { NextRequest, NextResponse } from "next/server";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";
import { createIssueSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

const log = createRequestLogger("/api/github/issues");

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

    const state = (request.nextUrl.searchParams.get("state") as "open" | "closed" | "all") || "open";
    const labels = request.nextUrl.searchParams.get("labels") || undefined;
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const perPage = parseInt(request.nextUrl.searchParams.get("perPage") || "30");

    const issues = await github.getIssues(repo, { state, labels, page, perPage });
    log.info({ repo, state, count: issues.length }, "Issues fetched");

    return NextResponse.json({ data: issues, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch issues");
    return NextResponse.json(
      { data: null, error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createIssueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Validation failed", details: parsed.error.issues },
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

    const { repo, title, body: issueBody, labels } = parsed.data;
    const repoName = repo.includes("/") ? repo.split("/").pop()! : repo;
    const issue = await github.createIssue(repoName, title, issueBody, labels);
    log.info({ repo, issueNumber: issue.number }, "Issue created");

    return NextResponse.json({ data: issue, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Failed to create issue");
    return NextResponse.json(
      { data: null, error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
