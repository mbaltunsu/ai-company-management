# CodeOps MCP Server

MCP server that gives Claude Code access to your CodeOps Kanban board tasks.

## Setup

### 1. Install and build

```bash
cd mcp-server
npm install
npm run build
```

### 2. Add to Claude Code

Add to your Claude Code MCP configuration (`~/.claude/settings.json` or project-level `.claude/settings.json`):

```json
{
  "mcpServers": {
    "codeops-tasks": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### 3. Available Tools

#### `get_tasks`
Fetch tasks from the Kanban board.

- **Input**: `{ projectId?: string }` — optional project ID filter
- **Output**: JSON array of tasks with all data

#### `update_task_status`
Move a task between Kanban columns.

- **Input**: `{ taskId: string, status: "backlog" | "in_progress" | "in_review" | "done" }`
- **Output**: Updated task data

## Development

```bash
npm run dev  # Run with tsx (no build needed)
```
