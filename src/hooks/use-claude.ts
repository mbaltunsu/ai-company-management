"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiResult, ClaudeSuggestion } from "@/types";

// ─── Suggest ──────────────────────────────────────────────────────────────────

interface SuggestPayload {
  taskTitle: string;
  taskDescription?: string;
  availableAgents: { name: string; description: string }[];
}

export function useClaudeSuggest() {
  return useMutation({
    mutationFn: async (payload: SuggestPayload): Promise<ClaudeSuggestion> => {
      const res = await fetch("/api/claude/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResult<ClaudeSuggestion> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as ClaudeSuggestion;
    },
  });
}

// ─── Test Connection ──────────────────────────────────────────────────────────

export function useClaudeTest() {
  return useMutation({
    mutationFn: async (apiKey: string): Promise<{ connected: boolean; error?: string }> => {
      const res = await fetch("/api/claude/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const json: ApiResult<{ connected: boolean; error?: string }> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data as { connected: boolean; error?: string };
    },
  });
}
