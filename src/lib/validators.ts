import { z } from "zod/v4";

// ============================================================
// Project Validators
// ============================================================

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  path: z.string().min(1, "Project path is required"),
  githubRepo: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  githubRepo: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const scanDirectorySchema = z.object({
  rootPath: z.string().min(1, "Root path is required"),
});

// ============================================================
// Goal Validators
// ============================================================

export const createGoalSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  title: z.string().min(1, "Goal title is required"),
  description: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

// ============================================================
// GitHub Validators
// ============================================================

export const createIssueSchema = z.object({
  repo: z.string().min(1, "Repository is required"),
  title: z.string().min(1, "Issue title is required"),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export const updateIssueSchema = z.object({
  repo: z.string().min(1, "Repository is required"),
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  state: z.enum(["open", "closed"]).optional(),
  labels: z.array(z.string()).optional(),
});

export const githubQuerySchema = z.object({
  repo: z.string().min(1, "Repository is required"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(30),
});

// ============================================================
// Agent Validators
// ============================================================

export const createAgentSchema = z.object({
  projectPath: z.string().min(1, "Project path is required"),
  name: z.string().min(1, "Agent name is required"),
  content: z.string().min(1, "Agent content is required"),
});

export const updateAgentSchema = z.object({
  content: z.string().min(1, "Agent content is required"),
});

// ============================================================
// Settings Validators
// ============================================================

export const updateSettingsSchema = z.object({
  githubToken: z.string().optional(),
  githubOwner: z.string().optional(),
  scanDirectories: z.array(z.string()).optional(),
  logLevel: z.enum(["debug", "info", "warn", "error"]).optional(),
  refreshInterval: z.number().int().min(10000).max(300000).optional(),
});
