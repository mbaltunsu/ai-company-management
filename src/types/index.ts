// ============================================================
// Project Types
// ============================================================

export interface Project {
  id: string;
  name: string;
  path: string;
  githubRepo: string | null;
  description: string | null;
  isAutoDiscovered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredProject {
  name: string;
  path: string;
  hasGit: boolean;
  hasClaudeConfig: boolean;
  agentCount: number;
  ruleCount: number;
}

export interface ProjectConfig {
  agents: Agent[];
  rules: Rule[];
  skills: string[];
}

// ============================================================
// Agent & Rule Types
// ============================================================

export interface Agent {
  name: string;
  filename: string;
  description: string;
  content: string;
}

export interface Rule {
  name: string;
  filename: string;
  content: string;
}

// ============================================================
// GitHub Types
// ============================================================

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorAvatar: string | null;
  date: string;
  url: string;
}

export interface GitHubBranch {
  name: string;
  commitSha: string;
  isDefault: boolean;
  isProtected: boolean;
  lastCommitDate: string | null;
}

export interface GitHubRelease {
  id: number;
  tagName: string;
  name: string;
  body: string | null;
  isDraft: boolean;
  isPrerelease: boolean;
  publishedAt: string | null;
  url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  labels: GitHubLabel[];
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface GitHubLabel {
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  starCount: number;
  openIssueCount: number;
  language: string | null;
  isPrivate: boolean;
  url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  updatedAt: string;
  url: string;
  starCount: number;
}

// ============================================================
// Goal Types
// ============================================================

export interface Goal {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  progress: number;
  status: "active" | "completed" | "archived";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Activity Types
// ============================================================

export type ActivityType = "commit" | "issue" | "release" | "agent_change" | "branch";

export interface ActivityEntry {
  id: string;
  projectId: string;
  type: ActivityType;
  title: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardStats {
  totalProjects: number;
  activeAgents: number;
  openIssues: number;
  commitsThisWeek: number;
}

export interface ProjectHealthInfo {
  projectId: string;
  projectName: string;
  health: number;
  status: "healthy" | "warning" | "critical";
}

// ============================================================
// Settings Types
// ============================================================

export interface AppSettings {
  githubToken: string;
  githubOwner: string;
  scanDirectories: string[];
  logLevel: string;
  refreshInterval: number;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
  details?: unknown;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
