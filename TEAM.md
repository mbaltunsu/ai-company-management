# Project Team

## Active Agents

- **api-designer**: REST API design, OpenAPI docs, auth patterns, versioning. Use for new endpoints or refactoring.
- **code-reviewer**: Code quality, security, best practices. Use after major features or before merges.
- **frontend-developer**: React components, pages, hooks. Use for any UI work alongside ui-designer.
- **git-workflow-manager**: Branching, merge strategies, worktrees. Use for parallel work coordination.
- **nextjs-developer**: Next.js 16 App Router, API routes, server components, Supabase integration. Primary backend agent.
- **performance-monitor**: Observability, metrics, performance optimization. Use for load testing and monitoring.
- **typescript-pro**: Advanced types, generics, type safety. Use for complex type-level work.
- **ui-designer**: Visual design, design systems, accessibility. Use with UI/UX Pro Max skill for design decisions.

## Agent Assignment Guide

| Task Type | Primary Agent | Support Agent |
|-----------|--------------|---------------|
| New API route | nextjs-developer | api-designer |
| New page/component | frontend-developer | ui-designer |
| Bug fix (backend) | nextjs-developer | code-reviewer |
| Bug fix (frontend) | frontend-developer | code-reviewer |
| DnD / canvas work | frontend-developer | typescript-pro |
| Design system changes | ui-designer | frontend-developer |
| Performance issues | performance-monitor | nextjs-developer |
| Git workflow | git-workflow-manager | — |
| Type system refactor | typescript-pro | nextjs-developer |

## Parallelization Strategy
- Backend + Frontend agents run in parallel when features span both
- Code reviewer runs after feature agents complete
- UI designer consulted before frontend-developer for design decisions
- Git workflow manager used when multiple agents need isolated worktrees

> If you add agents manually to `.claude/agents/`, add them to this file too.
