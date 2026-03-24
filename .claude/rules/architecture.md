# Architecture

## Overview
Full-stack dashboard application built with Next.js 16 App Router. Uses route groups: `(dashboard)` for authenticated pages with sidebar, `/login` standalone. Backend is Next.js API routes integrating with GitHub API (via OAuth), Claude API, and Supabase. An MCP server provides task management tools for Claude Code.

## Key Components
- **Dashboard UI** — Next.js pages with shadcn/ui; 14 routes including dashboard, projects, board, graph, tree, agents, skills, issues, goals, settings
- **API Routes** — 27 endpoints handling GitHub integration, Claude AI, tasks, goals, skills, libraries, settings, auth
- **GitHub Integration** — `src/lib/github.ts` wraps @octokit/rest; OAuth token from NextAuth session; fetches repos, commits, branches, releases, issues, and `.claude/agents/` files
- **Claude Integration** — `src/lib/claude.ts` wraps @anthropic-ai/sdk; generates task agent suggestions and prompts
- **Supabase Layer** — `src/lib/supabase/server.ts` (service_role key) and `src/lib/supabase/client.ts` (anon key); tables: projects, tasks, goals, skills, agent_libraries, app_settings, activity_log
- **Encryption** — `src/lib/encryption.ts` for AES-256-CBC encryption of stored API keys
- **Auth** — NextAuth.js v5 with GitHub OAuth + Credentials providers; middleware gate on all dashboard routes
- **Logging** — Pino-based structured logging via `src/lib/logger.ts`
- **MCP Server** — `mcp-server/` standalone package; tools: get_tasks, update_task_status

## Route Structure
```
src/app/
├── layout.tsx              # Root: html, body, ThemeInitializer, Providers
├── login/page.tsx          # Standalone login page
├── (dashboard)/            # Route group with sidebar layout
│   ├── layout.tsx          # Sidebar + main content wrapper
│   ├── page.tsx            # Dashboard overview
│   ├── projects/           # Project list + detail + sub-pages
│   ├── board/              # Kanban board
│   ├── graph/              # Network graph
│   ├── tree/               # Project hierarchy tree
│   ├── agents/             # Agent management + libraries
│   ├── skills/             # Skills management
│   ├── issues/             # GitHub issues
│   ├── goals/              # Goal tracking
│   └── settings/           # GitHub, Claude, Appearance, Account
└── api/                    # 27 API routes
```

## Data Flow
- UI hooks (`src/hooks/use-*.ts`) → TanStack Query → API routes → Supabase / GitHub / Claude
- Optimistic updates for DnD (Kanban board task moves)
- Session-based GitHub token (OAuth) passed through API routes to GitHubService
- Encrypted API keys stored in Supabase app_settings, decrypted server-side only

## Patterns
- Layered architecture: UI → hooks (TanStack Query) → API routes → services → external APIs
- TanStack Query key factories per domain (projectKeys, taskKeys, agentKeys, etc.)
- snake_case ↔ camelCase mapping at API route boundary
- Zod validation on all POST/PATCH payloads
- Structured logging on every API route (info success, warn client errors, error failures)
- Dynamic imports with `ssr: false` for canvas components (graph, force-graph)

## Constraints
- No direct Supabase/GitHub/Claude calls from UI components — always through API routes
- Business logic in `src/lib/` service modules
- All API routes must use `createRequestLogger()` for structured logging
- API keys must be encrypted before storage (use `src/lib/encryption.ts`)
- GitHub features require OAuth session — return 401 if not connected
