## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "Is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Task Management

1. **Plan First:** Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan:** Check in before starting implementation
3. **Track Progress:** Mark items complete as you go
4. **Explain Changes:** High-level summary at each step
5. **Document Results:** Add review section to `tasks/todo.md`
6. **Capture Lessons:** Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Impact minimal code.
- **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Only touch what's necessary. No side effects with new bugs.

## Code Change Rules

When modifying code:

- Never rewrite entire files unless necessary
- Prefer minimal diff changes
- Preserve existing architecture patterns
- Do not introduce new dependencies without reason
- Do not change naming conventions

Before changing:

1. Understand existing pattern
2. Follow same style
3. Keep changes minimal

## Debugging Protocol

When debugging:

Step 1 — Reproduce issue
Step 2 — Check logs
Step 3 — Check recent changes
Step 4 — Identify root cause
Step 5 — Fix cause not symptom
Step 6 — Verify no regressions

Never:

- Guess fixes
- Apply blind patches
- Change multiple systems at once

## Response Format Rules

When implementing features:

Always provide:

1. Plan
2. Files affected
3. Changes
4. Risks
5. Verification steps

For bug fixes provide:

1. Root cause
2. Fix
3. Why it happened
4. Prevention

## Performance Rules

Prefer:

- O(1) lookups
- Indexed queries
- Batch operations

Avoid:

- N+1 queries
- Unbounded loops on DB

Always:

- Cache expensive reads
- Use pagination

## AI Behavior Rules

Do not:

- Invent APIs
- Assume library behavior

If unsure:

- State uncertainty
- Suggest verification

Prefer:

- Existing project patterns
- Simple solutions
- Deterministic logic

## Agents and Rules

See [TEAM.md](TEAM.md) for the full agent roster.

- Use `.claude/rules/x.md` files for project-specific rules (architecture, tech stack, git, context).
- Add project-specific details to these files. Run `/team:init-project` to bootstrap them.

### Installed Agents and Rules

**Agents** (`.claude/agents/`):

- api-designer.md — Use this agent when designing new APIs, creating API specifications, or refactoring existing API architecture for scalability and developer experience. Invoke when you need REST/GraphQL endpoint design, OpenAPI documentation, authentication patterns, or API versioning strategies.
- code-reviewer.md — Use this agent when you need to conduct comprehensive code reviews focusing on code quality, security vulnerabilities, and best practices.
- frontend-developer.md — Use when building complete frontend applications across React, Vue, and Angular frameworks requiring multi-framework expertise and full-stack integration.
- git-workflow-manager.md — Use this agent when you need to design, establish, or optimize Git workflows, branching strategies, and merge management for a project or team.
- nextjs-developer.md — Use this agent when building production Next.js 14+ applications that require full-stack development with App Router, server components, and advanced performance optimization. Invoke when you need to architect or implement complete Next.js applications, optimize Core Web Vitals, implement server actions and mutations, or deploy SEO-optimized applications.
- performance-monitor.md — Use when establishing observability infrastructure to track system metrics, detect performance anomalies, and optimize resource usage across multi-agent environments.
- typescript-pro.md — Use when implementing TypeScript code requiring advanced type system patterns, complex generics, type-level programming, or end-to-end type safety across full-stack applications.
- ui-designer.md — Use this agent when designing visual interfaces, creating design systems, building component libraries, or refining user-facing aesthetics requiring expert visual design, interaction patterns, and accessibility considerations.

**Rules** (`.claude/rules/`):

- architecture.md
- git-rules.md
- project-context.md
- tech-stack.md
- Always use skills or agents that are specialized in frontend, UI/UX design when designing or developing the layout if they exist
-

### Team Collaboration Guidelines

- Always try to use TEAM agents for different tasks — distribute work efficiently
- Use subagents mode for parallelizable work (e.g., tests + implementation in parallel)
- Use worktrees and different branches for better teamwork — avoid conflicts
- Every agent should utilize git: commit frequently, use descriptive branch names
- Use design/architecture agents early in development before implementation agents
- When a new agent or rule is added manually, update TEAM.md and this section
- Run `/team:init-project` to bootstrap rules for a new project
- Run `/team:add-agent` to add a single agent by name or capability
- Run `/team:init-team` to set up a full agent roster

## DO NOTs

- Do not make text selectable in apps unless stated otherwise
- Do not assume, ask when you need clarification

## DOs

Always mobile first responsive app approach for frontend part of applications
