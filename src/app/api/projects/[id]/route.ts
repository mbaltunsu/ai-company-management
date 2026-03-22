import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { updateProjectSchema } from "@/lib/validators";
import { projectService } from "@/lib/projects";
import type { ApiResult, Project, ProjectConfig } from "@/types";

interface EnrichedProject extends Project {
  config: ProjectConfig | null;
  gitInfo: { branch: string | null; hasGit: boolean } | null;
  readme: string | null;
}

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id] — single project from Supabase enriched with filesystem data
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<EnrichedProject>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`GET /api/projects/${id}`);

  try {
    log.info({ id }, "Fetching project by id");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      log.warn({ id, err: error }, "Project not found");
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    const project: Project = {
      id: data.id,
      name: data.name,
      path: data.path,
      githubRepo: data.github_repo ?? null,
      description: data.description ?? null,
      isAutoDiscovered: data.is_auto_discovered ?? false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Enrich with filesystem data — failures are non-fatal
    let config: ProjectConfig | null = null;
    let gitInfo: { branch: string | null; hasGit: boolean } | null = null;
    let readme: string | null = null;

    try {
      config = await projectService.getProjectConfig(project.path);
    } catch (fsErr) {
      log.warn({ fsErr, path: project.path }, "Could not read project config from filesystem");
    }

    try {
      gitInfo = await projectService.getGitInfo(project.path);
    } catch (fsErr) {
      log.warn({ fsErr, path: project.path }, "Could not read git info from filesystem");
    }

    try {
      readme = await projectService.getReadme(project.path);
    } catch (fsErr) {
      log.warn({ fsErr, path: project.path }, "Could not read README from filesystem");
    }

    log.info({ id }, "Project fetched and enriched successfully");
    return NextResponse.json({ data: { ...project, config, gitInfo, readme }, error: null });
  } catch (err) {
    log.error({ err, id }, "Unexpected error fetching project");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] — update project metadata
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<Project>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`PATCH /api/projects/${id}`);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn({ id }, "Failed to parse request body as JSON");
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ id, issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates = parsed.data;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { data: null, error: "No fields to update" },
      { status: 400 }
    );
  }

  try {
    log.info({ id, updates }, "Updating project");

    const supabase = await createClient();

    // Build DB-column-mapped update object
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.githubRepo !== undefined) dbUpdates.github_repo = updates.githubRepo;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { data, error } = await supabase
      .from("projects")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      log.error({ err: error, id }, "Failed to update project");
      if (!data) {
        return NextResponse.json(
          { data: null, error: "Project not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { data: null, error: "Failed to update project" },
        { status: 500 }
      );
    }

    const project: Project = {
      id: data.id,
      name: data.name,
      path: data.path,
      githubRepo: data.github_repo ?? null,
      description: data.description ?? null,
      isAutoDiscovered: data.is_auto_discovered ?? false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    log.info({ id }, "Project updated successfully");
    return NextResponse.json({ data: project, error: null });
  } catch (err) {
    log.error({ err, id }, "Unexpected error updating project");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] — remove a project record from Supabase
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<{ id: string }>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`DELETE /api/projects/${id}`);

  try {
    log.info({ id }, "Deleting project");

    const supabase = await createClient();
    const { error, count } = await supabase
      .from("projects")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete project");
      return NextResponse.json(
        { data: null, error: "Failed to delete project" },
        { status: 500 }
      );
    }

    if (count === 0) {
      log.warn({ id }, "Project not found for deletion");
      return NextResponse.json(
        { data: null, error: "Project not found" },
        { status: 404 }
      );
    }

    log.info({ id }, "Project deleted successfully");
    return NextResponse.json({ data: { id }, error: null });
  } catch (err) {
    log.error({ err, id }, "Unexpected error deleting project");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
