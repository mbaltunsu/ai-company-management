import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";
import { updateAgentSchema } from "@/lib/validators";
import { projectService } from "@/lib/projects";
import type { ApiResult, Agent } from "@/types";

type RouteContext = { params: Promise<{ name: string }> };

function getProjectPath(request: NextRequest): string | null {
  const projectPath = request.nextUrl.searchParams.get("projectPath");
  return projectPath && projectPath.trim() !== "" ? projectPath : null;
}

// GET /api/agents/[name]?projectPath=<path> — get a single agent by name
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Agent>>> {
  const { name } = await context.params;
  const log = createRequestLogger(`GET /api/agents/${name}`);

  const projectPath = getProjectPath(request);
  if (!projectPath) {
    log.warn({ name }, "Missing required query param: projectPath");
    return NextResponse.json(
      { data: null, error: "Query parameter 'projectPath' is required" },
      { status: 400 }
    );
  }

  try {
    log.info({ projectPath, name }, "Fetching agent");

    const agent = await projectService.getAgent(projectPath, name);
    if (!agent) {
      log.warn({ projectPath, name }, "Agent not found");
      return NextResponse.json(
        { data: null, error: `Agent '${name}' not found` },
        { status: 404 }
      );
    }

    log.info({ projectPath, name }, "Agent fetched successfully");
    return NextResponse.json({ data: agent, error: null });
  } catch (err) {
    log.error({ err, projectPath, name }, "Failed to fetch agent");
    return NextResponse.json(
      { data: null, error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[name]?projectPath=<path> — update agent content
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Agent>>> {
  const { name } = await context.params;
  const log = createRequestLogger(`PATCH /api/agents/${name}`);

  const projectPath = getProjectPath(request);
  if (!projectPath) {
    log.warn({ name }, "Missing required query param: projectPath");
    return NextResponse.json(
      { data: null, error: "Query parameter 'projectPath' is required" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn({ name, projectPath }, "Failed to parse request body as JSON");
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateAgentSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ name, issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { content } = parsed.data;

  try {
    log.info({ projectPath, name }, "Updating agent");

    // Verify the agent exists before overwriting
    const existing = await projectService.getAgent(projectPath, name);
    if (!existing) {
      log.warn({ projectPath, name }, "Agent not found for update");
      return NextResponse.json(
        { data: null, error: `Agent '${name}' not found` },
        { status: 404 }
      );
    }

    await projectService.saveAgent(projectPath, name, content);

    const updated = await projectService.getAgent(projectPath, name);
    if (!updated) {
      log.error({ projectPath, name }, "Agent was updated but could not be read back");
      return NextResponse.json(
        { data: null, error: "Agent was updated but could not be retrieved" },
        { status: 500 }
      );
    }

    log.info({ projectPath, name }, "Agent updated successfully");
    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    log.error({ err, projectPath, name }, "Failed to update agent");
    return NextResponse.json(
      { data: null, error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[name]?projectPath=<path> — delete an agent file
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<{ name: string }>>> {
  const { name } = await context.params;
  const log = createRequestLogger(`DELETE /api/agents/${name}`);

  const projectPath = getProjectPath(request);
  if (!projectPath) {
    log.warn({ name }, "Missing required query param: projectPath");
    return NextResponse.json(
      { data: null, error: "Query parameter 'projectPath' is required" },
      { status: 400 }
    );
  }

  try {
    log.info({ projectPath, name }, "Deleting agent");

    // Verify the agent exists before attempting deletion
    const existing = await projectService.getAgent(projectPath, name);
    if (!existing) {
      log.warn({ projectPath, name }, "Agent not found for deletion");
      return NextResponse.json(
        { data: null, error: `Agent '${name}' not found` },
        { status: 404 }
      );
    }

    await projectService.deleteAgent(projectPath, name);

    log.info({ projectPath, name }, "Agent deleted successfully");
    return NextResponse.json({ data: { name }, error: null });
  } catch (err) {
    log.error({ err, projectPath, name }, "Failed to delete agent");
    return NextResponse.json(
      { data: null, error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
