"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResult, DashboardStats } from "@/types";

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  const json: ApiResult<DashboardStats> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });
}
