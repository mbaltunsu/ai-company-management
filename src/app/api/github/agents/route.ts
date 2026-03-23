import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createRequestLogger } from "@/lib/logger";
import { z } from "zod/v4";
import type { Agent, ApiResult } from "@/types";

const log = createRequestLogger("GET /api/github/agents");

const querySchema = z.object({
  repo: z.string().min(1, "repo is required"),
});

// GET /api/github/agents?repo=owner/repo
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<Agent[]>>> {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(raw);

  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "repo query parameter is required" },
      { status: 400 }
    );
  }

  const { repo } = parsed.data;

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

  // repo param is "owner/repo" — the service uses its own owner, so extract just the repo name
  const repoName = repo.includes("/") ? repo.split("/").pop()! : repo;

  try {
    log.info({ repo }, "Fetching agents from GitHub");
    const agents = await github.getRepoAgents(repoName);
    log.info({ repo, count: agents.length }, "Agents fetched successfully");
    return NextResponse.json({ data: agents, error: null });
  } catch (err) {
    log.error({ err, repo }, "Failed to fetch repo agents");
    return NextResponse.json(
      { data: null, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
