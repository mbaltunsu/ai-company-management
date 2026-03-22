"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal, ApiResult } from "@/types";

const goalKeys = {
  all: ["goals"] as const,
  byProject: (projectId: string) => ["goals", "project", projectId] as const,
  detail: (id: string) => ["goals", id] as const,
};

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResult<T> = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export function useGoals(projectId: string | null) {
  return useQuery({
    queryKey: projectId ? goalKeys.byProject(projectId) : goalKeys.all,
    queryFn: () => {
      const url = projectId
        ? `/api/goals?projectId=${projectId}`
        : "/api/goals";
      return fetchApi<Goal[]>(url);
    },
    enabled: projectId !== undefined,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      title: string;
      description?: string | null;
      dueDate?: string | null;
    }) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResult<Goal> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as Goal;
    },
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.byProject(goal.projectId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string | null;
      progress?: number;
      status?: Goal["status"];
      dueDate?: string | null;
    }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json: ApiResult<Goal> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as Goal;
    },
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goal.id) });
      queryClient.invalidateQueries({ queryKey: goalKeys.byProject(goal.projectId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; projectId: string }) => {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      const json: ApiResult<{ deleted: true }> = await res.json();
      if (json.error) throw new Error(json.error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.byProject(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
