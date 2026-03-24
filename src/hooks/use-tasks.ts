"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, ApiResult } from "@/types";

// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const taskKeys = {
  all: (projectId: string | null) =>
    projectId ? (["tasks", projectId] as const) : (["tasks"] as const),
  detail: (id: string) => ["tasks", "detail", id] as const,
};

// ─── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchTasks(projectId: string | null): Promise<Task[]> {
  const url = projectId
    ? `/api/tasks?projectId=${encodeURIComponent(projectId)}`
    : "/api/tasks";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  const json: ApiResult<Task[]> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useTasks(projectId: string | null) {
  return useQuery({
    queryKey: taskKeys.all(projectId),
    queryFn: () => fetchTasks(projectId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      projectId?: string | null;
      title: string;
      description?: string | null;
      status?: Task["status"];
      priority?: Task["priority"];
      assignedAgents?: string[];
      suggestedPrompt?: string | null;
    }): Promise<Task> => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResult<Task> = await res.json();
      if (json.error) throw new Error(json.error);
      if (!json.data) throw new Error("No data returned");
      return json.data;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(task.projectId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all(null) });
    },
  });
}

export function useUpdateTask(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      title?: string;
      description?: string | null;
      status?: Task["status"];
      priority?: Task["priority"];
      assignedAgents?: string[];
      suggestedPrompt?: string | null;
      order?: number;
    }): Promise<Task> => {
      const { id, ...rest } = payload;
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      const json: ApiResult<Task> = await res.json();
      if (json.error) throw new Error(json.error);
      if (!json.data) throw new Error("No data returned");
      return json.data;
    },
    onMutate: async (newData) => {
      // Cancel in-flight refetches for both cache keys to prevent overwrites
      await queryClient.cancelQueries({ queryKey: taskKeys.all(projectId) });
      await queryClient.cancelQueries({ queryKey: taskKeys.all(null) });

      const previousForProject = queryClient.getQueryData(taskKeys.all(projectId));
      const previousForAll = queryClient.getQueryData(taskKeys.all(null));

      const applyUpdate = (old: Task[] | undefined) =>
        old?.map((t) => (t.id === newData.id ? { ...t, ...newData } : t));

      queryClient.setQueryData(taskKeys.all(projectId), applyUpdate);
      // Only update the all-projects cache when we are not already in that view
      // (avoids double-updating when projectId is null)
      if (projectId !== null) {
        queryClient.setQueryData(taskKeys.all(null), applyUpdate);
      }

      return { previousForProject, previousForAll };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousForProject !== undefined) {
        queryClient.setQueryData(taskKeys.all(projectId), context.previousForProject);
      }
      if (context?.previousForAll !== undefined) {
        queryClient.setQueryData(taskKeys.all(null), context.previousForAll);
      }
    },
    onSuccess: () => {
      // Only invalidate on success — onError already rolled back via setQueryData
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      if (projectId !== null) {
        queryClient.invalidateQueries({ queryKey: taskKeys.all(null) });
      }
    },
  });
}

export function useDeleteTask(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const json: ApiResult<{ deleted: true }> = await res.json();
      if (json.error) throw new Error(json.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all(null) });
    },
  });
}
