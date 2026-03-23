import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { createProjectSchema } from "@/lib/validators";
import type { ApiResult, Project } from "@/types";

// GET /api/projects — list all registered projects from Supabase
export async function GET(): Promise<NextResponse<ApiResult<Project[]>>> {
  const log = createRequestLogger("GET /api/projects");

  try {
    log.info("Fetching all projects");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      log.error({ err: error }, "Supabase query failed");
      return NextResponse.json(
        { data: null, error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    const projects: Project[] = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      path: row.path,
      githubRepo: row.github_repo ?? null,
      description: row.description ?? null,
      isAutoDiscovered: row.is_auto_discovered ?? false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    log.info({ count: projects.length }, "Projects fetched successfully");
    return NextResponse.json({ data: projects, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error fetching projects");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects — register a new project
export async function POST(request: NextRequest): Promise<NextResponse<ApiResult<Project>>> {
  const log = createRequestLogger("POST /api/projects");

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

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, path, githubRepo, description } = parsed.data;

  try {
    log.info({ name, path }, "Registering new project");

    // If no local path provided (GitHub import), use the repo name as a unique placeholder
    const resolvedPath = path || (githubRepo ? `github:${githubRepo}` : name);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        path: resolvedPath,
        github_repo: githubRepo ?? null,
        description: description ?? null,
        is_auto_discovered: false,
      })
      .select()
      .single();

    if (error) {
      log.error({ err: error, name, path }, "Failed to insert project");
      // Surface unique constraint violations as 409 Conflict
      if (error.code === "23505") {
        return NextResponse.json(
          { data: null, error: "A project with this path already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { data: null, error: "Failed to register project" },
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

    log.info({ id: project.id, name: project.name }, "Project registered successfully");
    return NextResponse.json({ data: project, error: null }, { status: 201 });
  } catch (err) {
    log.error({ err }, "Unexpected error registering project");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
