"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Agent, ApiResult } from "@/types";

// Query key factory
export const agentKeys = {
  all: (projectPath: string) => ["agents", projectPath] as const,
  detail: (projectPath: string, name: string) => ["agents", projectPath, name] as const,
};

async function fetchAgents(projectPath: string): Promise<Agent[]> {
  const params = new URLSearchParams({ projectPath });
  const res = await fetch(`/api/agents?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch agents: ${res.statusText}`);
  const json: ApiResult<Agent[]> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

async function fetchAgent(projectPath: string, name: string): Promise<Agent> {
  const params = new URLSearchParams({ projectPath });
  const res = await fetch(`/api/agents/${encodeURIComponent(name)}?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch agent: ${res.statusText}`);
  const json: ApiResult<Agent> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

async function createAgent(data: {
  projectPath: string;
  name: string;
  content: string;
}): Promise<Agent> {
  const res = await fetch("/api/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: ApiResult<Agent> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

async function updateAgent(data: {
  projectPath: string;
  name: string;
  content: string;
}): Promise<Agent> {
  const params = new URLSearchParams({ projectPath: data.projectPath });
  const res = await fetch(`/api/agents/${encodeURIComponent(data.name)}?${params}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: data.content }),
  });
  const json: ApiResult<Agent> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

async function deleteAgent(data: { projectPath: string; name: string }): Promise<{ name: string }> {
  const params = new URLSearchParams({ projectPath: data.projectPath });
  const res = await fetch(`/api/agents/${encodeURIComponent(data.name)}?${params}`, {
    method: "DELETE",
  });
  const json: ApiResult<{ name: string }> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

export function useAgents(projectPath: string | null) {
  return useQuery({
    queryKey: projectPath ? agentKeys.all(projectPath) : ["agents", null],
    queryFn: () => fetchAgents(projectPath!),
    enabled: Boolean(projectPath),
  });
}

export function useAgent(projectPath: string | null, name: string | null) {
  return useQuery({
    queryKey:
      projectPath && name ? agentKeys.detail(projectPath, name) : ["agents", null, null],
    queryFn: () => fetchAgent(projectPath!, name!),
    enabled: Boolean(projectPath) && Boolean(name),
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all(variables.projectPath) });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all(variables.projectPath) });
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.projectPath, variables.name),
      });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all(variables.projectPath) });
    },
  });
}
