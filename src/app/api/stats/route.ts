import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGitHubServiceFromSession } from "@/lib/github";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import type { ApiResult, DashboardStats } from "@/types";

const log = createRequestLogger("GET /api/stats");

const MAX_PROJECTS = 10;

// GET /api/stats — aggregated dashboard statistics
export async function GET(): Promise<NextResponse<ApiResult<DashboardStats>>> {
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

  try {
    log.info("Fetching dashboard stats");

    const supabase = await createClient();

    const { data: projects, error: dbError } = await supabase
      .from("projects")
      .select("id, github_repo")
      .limit(MAX_PROJECTS);

    if (dbError) {
      log.error({ err: dbError }, "Failed to query projects from Supabase");
      return NextResponse.json(
        { data: null, error: "Failed to query projects" },
        { status: 500 }
      );
    }

    const totalProjects = projects?.length ?? 0;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let activeAgents = 0;
    let openIssues = 0;
    let commitsThisWeek = 0;

    const repoProjects = (projects ?? []).filter(
      (p): p is typeof p & { github_repo: string } =>
        typeof p.github_repo === "string" && p.github_repo.length > 0
    );

    await Promise.all(
      repoProjects.map(async (project) => {
        const repoName = project.github_repo.includes("/")
          ? project.github_repo.split("/").pop()!
          : project.github_repo;

        const results = await Promise.allSettled([
          github.getRepoAgents(repoName),
          github.getIssues(repoName, { state: "open", perPage: 100 }),
          github.getCommits(repoName, { since: oneWeekAgo, perPage: 100 }),
        ]);

        const [agentsResult, issuesResult, commitsResult] = results;

        if (agentsResult.status === "fulfilled") {
          activeAgents += agentsResult.value.length;
        } else {
          log.warn({ repo: repoName, err: agentsResult.reason }, "Failed to fetch agents");
        }

        if (issuesResult.status === "fulfilled") {
          openIssues += issuesResult.value.length;
        } else {
          log.warn({ repo: repoName, err: issuesResult.reason }, "Failed to fetch issues");
        }

        if (commitsResult.status === "fulfilled") {
          commitsThisWeek += commitsResult.value.length;
        } else {
          log.warn({ repo: repoName, err: commitsResult.reason }, "Failed to fetch commits");
        }
      })
    );

    const stats: DashboardStats = {
      totalProjects,
      activeAgents,
      openIssues,
      commitsThisWeek,
    };

    log.info({ stats }, "Dashboard stats computed");
    return NextResponse.json({ data: stats, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error computing dashboard stats");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
