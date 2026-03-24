# Project Context

## Purpose
A personal company management dashboard ("CodeOps") for managing all Claude Code projects from a single UI. The owner can import GitHub repositories, track project progress/goals/commits/branches/releases, manage per-project agents/rules/skills, create GitHub issues, use a Kanban board with AI-powered task suggestions, visualize project networks and hierarchies, and oversee their AI agent team.

## Users / Audience
Single user — the solo founder/developer. Demo login with credentials provider (demo@codeops.dev). GitHub OAuth for real GitHub integration.

## Current State
Production — deployed to Vercel at https://ai-company-management.vercel.app. All core features implemented.

## Live Features
1. **Dashboard** — Stats bar, project cards, activity feed, project health
2. **Projects** — Import from GitHub, project detail with commits/branches/releases/issues/agents/skills tabs
3. **Network Graph** — Force-directed visualization of projects and agents (react-force-graph-2d)
4. **Project Tree** — Recursive hierarchy with CSS connecting lines, re-parenting dropdown
5. **Kanban Board** — DnD task management with 4 columns, priority glow effects, expand/collapse cards
6. **Claude AI** — Auto agent suggestions on task creation, "Ask Claude" with confirmation UI
7. **Agents** — Per-project agents from GitHub .claude/agents/, agent libraries from external repos
8. **Skills** — Global and per-project skills CRUD
9. **Issues & Goals** — GitHub issue sync + goal tracking with progress bars
10. **Settings** — GitHub OAuth status, Claude API key (encrypted), 6 themes + color picker, sign out
11. **MCP Server** — Standalone server for Claude Code to read/update tasks

## Key Infrastructure
- **Auth**: NextAuth.js v5 beta with GitHub OAuth + Credentials (demo) providers
- **Database**: Supabase (projects, tasks, goals, skills, agent_libraries, app_settings, activity_log)
- **API**: 27 Next.js API routes with Zod validation and structured pino logging
- **Encryption**: AES-256-CBC for stored API keys (ENCRYPTION_KEY in env)
- **Deployment**: Vercel with auto-deploy from GitHub

## Do Not
- Do not use `console.log` in production code paths — use the structured logger
- Do not hardcode tokens or secrets — use environment variables or encrypted Supabase storage
- Do not skip input validation at API boundaries
- Do not remove GitHub OAuth flow — it's the primary auth mechanism
- Do not store API keys in plaintext — always use the encryption module
