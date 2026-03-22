import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";
import { createAgentSchema } from "@/lib/validators";
import { projectService } from "@/lib/projects";
import type { ApiResult, Agent } from "@/types";

// GET /api/agents?projectPath=<path> — list all agents for a project
export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<Agent[]>>> {
  const log = createRequestLogger("GET /api/agents");

  const projectPath = request.nextUrl.searchParams.get("projectPath");
  if (!projectPath || projectPath.trim() === "") {
    log.warn("Missing required query param: projectPath");
    return NextResponse.json(
      { data: null, error: "Query parameter 'projectPath' is required" },
      { status: 400 }
    );
  }

  try {
    log.info({ projectPath }, "Listing agents for project");

    const config = await projectService.getProjectConfig(projectPath);

    log.info({ projectPath, count: config.agents.length }, "Agents fetched successfully");
    return NextResponse.json({ data: config.agents, error: null });
  } catch (err) {
    log.error({ err, projectPath }, "Failed to read agents from filesystem");
    return NextResponse.json(
      { data: null, error: "Failed to read agents for the specified project path" },
      { status: 500 }
    );
  }
}

// POST /api/agents — create a new agent file on the filesystem
export async function POST(request: NextRequest): Promise<NextResponse<ApiResult<Agent>>> {
  const log = createRequestLogger("POST /api/agents");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn("Failed to parse request body as JSON");
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { projectPath, name, content } = parsed.data;

  try {
    log.info({ projectPath, name }, "Creating agent");

    // Check if agent already exists to return a clear conflict response
    const existing = await projectService.getAgent(projectPath, name);
    if (existing) {
      log.warn({ projectPath, name }, "Agent already exists");
      return NextResponse.json(
        { data: null, error: `Agent '${name}' already exists in this project` },
        { status: 409 }
      );
    }

    await projectService.saveAgent(projectPath, name, content);

    // Read back the saved agent so we return a fully-populated Agent object
    const agent = await projectService.getAgent(projectPath, name);
    if (!agent) {
      log.error({ projectPath, name }, "Agent was saved but could not be read back");
      return NextResponse.json(
        { data: null, error: "Agent was created but could not be retrieved" },
        { status: 500 }
      );
    }

    log.info({ projectPath, name }, "Agent created successfully");
    return NextResponse.json({ data: agent, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err, projectPath, name }, "Failed to create agent");
    return NextResponse.json(
      { data: null, error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
