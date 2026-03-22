# Project Context

## Purpose
A personal company management dashboard for managing all Claude Code projects from a single UI. The owner can track project progress, goals, commits, branch graphics, releases, and versions; manage per-project agents/rules/skills; open GitHub issues directly from the dashboard; and oversee their AI agent team.

## Users / Audience
Single user — the solo founder/developer running their own company. No multi-user or auth requirements initially.

## Current State
Greenfield — no code written yet. Starting from scratch.

## Key Goals
1. Build a functional dashboard to manage all Claude Code projects in one place
2. Integrate with GitHub for issue sync, commit data, branch/release/version visualization
3. Implement per-project management of agents, rules, and skills
4. Add structured logging from day one for debugging and future monitoring

## Do Not
- Do not use `console.log` in production code paths — use the structured logger
- Do not hardcode GitHub tokens or secrets — use environment variables
- Do not skip input validation at API boundaries
- Do not add multi-user or authentication complexity until explicitly requested
- Do not over-engineer early — build features as requested, keep it simple and clear
