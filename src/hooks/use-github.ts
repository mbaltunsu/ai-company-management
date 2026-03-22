"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GitHubCommit,
  GitHubBranch,
  GitHubRelease,
  GitHubIssue,
  GitHubRateLimit,
  ApiResult,
} from "@/types";

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResult<T> = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export function useCommits(repo: string | null, options?: { since?: string; until?: string }) {
  return useQuery({
    queryKey: ["github", "commits", repo, options],
    queryFn: () => {
      const params = new URLSearchParams({ repo: repo! });
      if (options?.since) params.set("since", options.since);
      if (options?.until) params.set("until", options.until);
      return fetchApi<GitHubCommit[]>(`/api/github/commits?${params}`);
    },
    enabled: !!repo,
    refetchInterval: 60 * 1000,
  });
}

export function useBranches(repo: string | null) {
  return useQuery({
    queryKey: ["github", "branches", repo],
    queryFn: () => fetchApi<GitHubBranch[]>(`/api/github/branches?repo=${repo}`),
    enabled: !!repo,
    refetchInterval: 60 * 1000,
  });
}

export function useReleases(repo: string | null) {
  return useQuery({
    queryKey: ["github", "releases", repo],
    queryFn: () => fetchApi<GitHubRelease[]>(`/api/github/releases?repo=${repo}`),
    enabled: !!repo,
  });
}

export function useIssues(
  repo: string | null,
  options?: { state?: "open" | "closed" | "all"; labels?: string }
) {
  return useQuery({
    queryKey: ["github", "issues", repo, options],
    queryFn: () => {
      const params = new URLSearchParams({ repo: repo! });
      if (options?.state) params.set("state", options.state);
      if (options?.labels) params.set("labels", options.labels);
      return fetchApi<GitHubIssue[]>(`/api/github/issues?${params}`);
    },
    enabled: !!repo,
    refetchInterval: 60 * 1000,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { repo: string; title: string; body?: string; labels?: string[] }) => {
      const res = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResult<GitHubIssue> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as GitHubIssue;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["github", "issues", variables.repo] });
    },
  });
}

export function useRateLimit() {
  return useQuery({
    queryKey: ["github", "rate-limit"],
    queryFn: () => fetchApi<GitHubRateLimit>("/api/github/rate-limit"),
    refetchInterval: 5 * 60 * 1000,
  });
}
