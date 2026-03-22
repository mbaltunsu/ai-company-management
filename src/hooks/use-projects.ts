"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project, ApiResult } from "@/types";

// Query key factory — single source of truth for cache keys
export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
};

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);

  const json: ApiResult<Project[]> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");

  return json.data;
}

async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch project: ${res.statusText}`);

  const json: ApiResult<Project> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");

  return json.data;
}

async function scanProjects(rootPath: string): Promise<unknown> {
  const res = await fetch("/api/projects/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rootPath }),
  });

  if (!res.ok) throw new Error(`Scan failed: ${res.statusText}`);

  const json: ApiResult<unknown> = await res.json();
  if (json.error) throw new Error(json.error);

  return json.data;
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: fetchProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  });
}

export function useScanProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rootPath }: { rootPath: string }) => scanProjects(rootPath),
    onSuccess: () => {
      // Invalidate and re-fetch the project list after a successful scan
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
