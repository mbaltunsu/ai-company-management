"use client";

import { useQueries } from "@tanstack/react-query";
import { useProjects } from "@/hooks/use-projects";
import type { GraphNode, GraphLink, Agent, ApiResult, DashboardStats } from "@/types";

const HIGH_ACTIVITY_COLOR = "#f59e0b";
const MEDIUM_ACTIVITY_COLOR = "#6366f1";
const LOW_ACTIVITY_COLOR = "#52525b";
const AGENT_COLOR = "#6366f1";

async function fetchGitHubAgents(repo: string): Promise<Agent[]> {
  const params = new URLSearchParams({ repo });
  const res = await fetch(`/api/github/agents?${params}`);
  if (!res.ok) return [];
  const json: ApiResult<Agent[]> = await res.json();
  if (json.error || !json.data) return [];
  return json.data;
}

async function fetchStats(): Promise<DashboardStats | null> {
  const res = await fetch("/api/stats");
  if (!res.ok) return null;
  const json: ApiResult<DashboardStats> = await res.json();
  if (json.error || !json.data) return null;
  return json.data;
}

function getActivityColor(commitsThisWeek: number, totalCommits: number): string {
  if (totalCommits === 0) return LOW_ACTIVITY_COLOR;
  const share = commitsThisWeek / totalCommits;
  if (share > 0.35) return HIGH_ACTIVITY_COLOR;
  if (share > 0.1 || commitsThisWeek > 0) return MEDIUM_ACTIVITY_COLOR;
  return LOW_ACTIVITY_COLOR;
}

export function useGraphData() {
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const repoProjects = (projects ?? []).filter(
    (p): p is typeof p & { githubRepo: string } =>
      typeof p.githubRepo === "string" && p.githubRepo.length > 0
  );

  const agentQueries = useQueries({
    queries: repoProjects.map((project) => ({
      queryKey: ["graph-agents", project.githubRepo],
      queryFn: () => fetchGitHubAgents(project.githubRepo),
      staleTime: 60_000,
    })),
  });

  const statsQuery = useQueries({
    queries: [
      {
        queryKey: ["graph-stats"],
        queryFn: fetchStats,
        staleTime: 60_000,
      },
    ],
  });

  const stats = statsQuery[0]?.data ?? null;
  const commitsThisWeek = stats?.commitsThisWeek ?? 0;

  const isLoading =
    projectsLoading ||
    agentQueries.some((q) => q.isLoading) ||
    statsQuery[0]?.isLoading === true;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  if (projects && !isLoading) {
    projects.forEach((project) => {
      const repoIndex = repoProjects.findIndex((rp) => rp.id === project.id);
      const agentList: Agent[] =
        repoIndex >= 0 ? (agentQueries[repoIndex]?.data ?? []) : [];

      const agentCount = agentList.length;
      const size = Math.min(20 + agentCount * 3, 45);

      // Distribute the global commitsThisWeek across projects proportionally by agent count
      const totalAgents = projects.reduce((sum, p) => {
        const ri = repoProjects.findIndex((rp) => rp.id === p.id);
        const al = ri >= 0 ? (agentQueries[ri]?.data?.length ?? 0) : 0;
        return sum + al;
      }, 0);

      const projectShare = totalAgents > 0 ? agentCount / totalAgents : 0;
      const estimatedCommits = Math.round(commitsThisWeek * projectShare);

      const color = getActivityColor(estimatedCommits, commitsThisWeek);

      nodes.push({
        id: project.id,
        type: "project",
        label: project.name,
        projectId: project.id,
        size,
        color,
        glow: color !== LOW_ACTIVITY_COLOR ? color : undefined,
      });

      agentList.forEach((agent) => {
        const agentId = `agent-${project.id}-${agent.name}`;
        nodes.push({
          id: agentId,
          type: "agent",
          label: agent.name,
          projectId: project.id,
          size: 10,
          color: AGENT_COLOR,
        });
        links.push({ source: agentId, target: project.id });
      });
    });
  }

  return { nodes, links, isLoading };
}
