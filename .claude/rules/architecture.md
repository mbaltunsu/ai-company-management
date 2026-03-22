# Architecture

## Overview
Single-page dashboard application (monolith) built with Next.js. The UI layer communicates with a backend via Next.js API routes, which integrate with GitHub's API and the local filesystem to manage Claude Code project data. All project state (agents, rules, skills, issues) is persisted per-project.

## Key Components
- **Dashboard UI** — Next.js pages/app router with shadcn/ui components; project overview, progress charts, commit graphs, branch/release/version visualizations
- **API Routes** — Next.js API routes serving as the backend layer; handle GitHub integration, project config reads/writes, issue sync
- **GitHub Integration Layer** — Wraps GitHub REST API for issue creation/sync, commit fetching, branch/release/version data
- **Project Config Manager** — Reads/writes per-project `.claude/` directories (agents, rules, skills)
- **Logging System** — Structured logging layer used across API routes and background jobs for debugging and future monitoring

## Patterns
- Layered architecture: UI → API routes → service layer → external integrations (GitHub)
- Repository pattern for data access (project configs, GitHub data)
- No direct GitHub API calls or filesystem access from UI components
- Each project is self-contained: its own agents, rules, skills, issues, goals

## Constraints
- No direct data access or external API calls from UI/presentation layer
- Business logic lives in service modules under `src/lib/` or `src/services/`
- All API routes must log requests and errors via the structured logging system
- Logging must be structured (JSON-compatible) to support future monitoring ingestion
