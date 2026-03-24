"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AgentLibrary, ApiResult } from "@/types";

// Query key factory
export const libraryKeys = {
  all: ["libraries"] as const,
  detail: (id: string) => ["libraries", id] as const,
};

async function fetchLibraries(): Promise<AgentLibrary[]> {
  const res = await fetch("/api/libraries");
  if (!res.ok) throw new Error(`Failed to fetch libraries: ${res.statusText}`);
  const json: ApiResult<AgentLibrary[]> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

async function createLibrary(data: {
  name: string;
  repo: string;
  description?: string | null;
}): Promise<AgentLibrary> {
  const res = await fetch("/api/libraries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json: ApiResult<AgentLibrary> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

async function deleteLibrary(id: string): Promise<void> {
  const res = await fetch(`/api/libraries/${id}`, { method: "DELETE" });
  const json: ApiResult<unknown> = await res.json();
  if (json.error) throw new Error(json.error);
}

export function useLibraries() {
  return useQuery({
    queryKey: libraryKeys.all,
    queryFn: fetchLibraries,
  });
}

export function useCreateLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLibrary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  });
}

export function useDeleteLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLibrary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  });
}
