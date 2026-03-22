# Tech Stack

## Runtime / Language
- Node.js (latest LTS), TypeScript 5

## Frameworks
- Next.js 14+ (App Router)
- React 18
- Tailwind CSS
- shadcn/ui (component library)

## Key Dependencies
- `@octokit/rest` — GitHub REST API client
- `recharts` or `tremor` — charts and progress visualizations
- `winston` or `pino` — structured logging
- `zod` — schema validation at API boundaries
- `swr` or `react-query` — data fetching and caching on client

## Dev Tools
- ESLint + Prettier
- TypeScript strict mode
- Vitest or Jest for unit tests

## Conventions
- All API routes validate input with Zod schemas
- All service functions return typed results (no `any`)
- Logging via the centralized logger — never use `console.log` in production paths
- Components live in `src/components/`, pages in `src/app/`, services in `src/lib/`
- Use `camelCase` for variables/functions, `PascalCase` for components/types
