"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Skill, ApiResult } from "@/types";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const skillKeys = {
  all: ["skills"] as const,
  byProject: (projectId: string) => ["skills", "project", projectId] as const,
  global: ["skills", "global"] as const,
  detail: (id: string) => ["skills", id] as const,
};

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResult<T> = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSkills(projectId: string | null) {
  return useQuery({
    queryKey: projectId ? skillKeys.byProject(projectId) : skillKeys.all,
    queryFn: () => {
      const url = projectId
        ? `/api/skills?projectId=${projectId}`
        : "/api/skills";
      return fetchApi<Skill[]>(url);
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId?: string | null;
      name: string;
      description?: string | null;
      whenToUse?: string | null;
    }): Promise<Skill> => {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResult<Skill> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as Skill;
    },
    onSuccess: (skill) => {
      if (skill.projectId) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.byProject(skill.projectId),
        });
      }
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      description?: string | null;
      whenToUse?: string | null;
    }): Promise<Skill> => {
      const res = await fetch(`/api/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json: ApiResult<Skill> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as Skill;
    },
    onSuccess: (skill) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.detail(skill.id) });
      if (skill.projectId) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.byProject(skill.projectId),
        });
      }
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      projectId?: string | null;
    }): Promise<void> => {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      const json: ApiResult<{ deleted: true }> = await res.json();
      if (json.error) throw new Error(json.error);
    },
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.byProject(variables.projectId),
        });
      }
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}
