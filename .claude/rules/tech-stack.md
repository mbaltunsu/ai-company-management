# Tech Stack

## Runtime / Language
- Node.js v22.22.1 (LTS), TypeScript 5

## Frameworks
- Next.js 16.2.1 (App Router with route groups)
- React 18
- Tailwind CSS 3.4
- shadcn/ui (component library, Radix primitives)

## Key Dependencies
- `@octokit/rest` — GitHub REST API client
- `@anthropic-ai/sdk` — Claude API integration
- `@supabase/supabase-js` + `@supabase/ssr` — Database + server-side auth
- `next-auth@5.0.0-beta.30` — Authentication (GitHub OAuth + Credentials)
- `@tanstack/react-query` — Data fetching, caching, optimistic updates
- `recharts` — Charts and progress visualizations
- `react-force-graph-2d` — Network graph visualization
- `@dnd-kit/core` + `@dnd-kit/sortable` — Drag-and-drop for Kanban
- `pino` — Structured logging
- `zod/v4` — Schema validation at API boundaries (import from `zod/v4`)
- `sonner` — Toast notifications
- `lucide-react` — Icons

## Dev Tools
- ESLint 9 + eslint-config-next
- TypeScript strict mode
- `tsx` for scripts

## Conventions
- All API routes validate input with Zod schemas (import from `zod/v4`)
- All service functions return typed `ApiResult<T>` (no `any`)
- Logging via `createRequestLogger()` from `src/lib/logger` — never use `console.log`
- Components in `src/components/`, pages in `src/app/(dashboard)/`, services in `src/lib/`
- Hooks in `src/hooks/` with `use-` prefix and TanStack Query key factories
- Use `camelCase` for variables/functions, `PascalCase` for components/types
- API routes map `snake_case` DB columns to `camelCase` TypeScript types
- Dynamic route params use `await context.params` (Next.js 16 async pattern)
- Use `next/dynamic` with `ssr: false` for canvas/browser-only components
