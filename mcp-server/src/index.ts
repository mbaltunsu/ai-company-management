#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// ── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: "backlog" | "in_progress" | "in_review" | "done";
  assignedAgents: string[];
  suggestedPrompt: string | null;
  priority: "urgent" | "high" | "normal" | "low";
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function mapRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    projectId: (row.project_id as string) ?? null,
    title: row.title as string,
    description: (row.description as string) ?? null,
    status: row.status as Task["status"],
    assignedAgents: (row.assigned_agents as string[]) ?? [],
    suggestedPrompt: (row.suggested_prompt as string) ?? null,
    priority: row.priority as Task["priority"],
    order: (row.order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "codeops-tasks",
  version: "1.0.0",
});

// Tool: get_tasks
server.tool(
  "get_tasks",
  "Fetch tasks from the CodeOps Kanban board. Optionally filter by project ID. Returns all task data including title, description, status, priority, assigned agents, and AI-suggested prompts.",
  {
    projectId: z.string().uuid().optional().describe(
      "Filter tasks by project ID. Omit to get all tasks."
    ),
  },
  async ({ projectId }) => {
    const supabase = getSupabase();

    let query = supabase
      .from("tasks")
      .select("*")
      .order("status")
      .order("order");

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        content: [{ type: "text", text: `Error fetching tasks: ${error.message}` }],
        isError: true,
      };
    }

    const tasks = (data ?? []).map(mapRow);

    return {
      content: [{
        type: "text",
        text: JSON.stringify(tasks, null, 2),
      }],
    };
  }
);

// Tool: update_task_status
server.tool(
  "update_task_status",
  "Update the status of a task on the CodeOps Kanban board. Use this to move tasks between columns: backlog, in_progress, in_review, done.",
  {
    taskId: z.string().uuid().describe("The UUID of the task to update"),
    status: z.enum(["backlog", "in_progress", "in_review", "done"]).describe(
      "The new status for the task"
    ),
  },
  async ({ taskId, status }) => {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("tasks")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      return {
        content: [{ type: "text", text: `Error updating task: ${error.message}` }],
        isError: true,
      };
    }

    const task = mapRow(data);

    return {
      content: [{
        type: "text",
        text: `Task "${task.title}" status updated to ${task.status}\n\n${JSON.stringify(task, null, 2)}`,
      }],
    };
  }
);

// ── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CodeOps MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
