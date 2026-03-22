import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { scanDirectorySchema } from "@/lib/validators";
import { projectService } from "@/lib/projects";
import type { ApiResult, DiscoveredProject } from "@/types";

interface ScanResult {
  discovered: DiscoveredProject[];
  registered: number;
  skipped: number;
}

// POST /api/projects/scan — scan a root directory and auto-register discovered projects
export async function POST(request: NextRequest): Promise<NextResponse<ApiResult<ScanResult>>> {
  const log = createRequestLogger("POST /api/projects/scan");

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

  const parsed = scanDirectorySchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { rootPath } = parsed.data;

  try {
    log.info({ rootPath }, "Starting directory scan");

    const discovered = await projectService.scanDirectory(rootPath);
    log.info({ count: discovered.length, rootPath }, "Scan complete, registering projects");

    const supabase = await createClient();
    let registered = 0;
    let skipped = 0;

    for (const project of discovered) {
      // Use upsert on path to avoid duplicate constraint violations
      const { error } = await supabase
        .from("projects")
        .upsert(
          {
            name: project.name,
            path: project.path,
            github_repo: null,
            description: null,
            is_auto_discovered: true,
          },
          { onConflict: "path", ignoreDuplicates: true }
        );

      if (error) {
        log.warn({ err: error, path: project.path }, "Failed to upsert project, skipping");
        skipped++;
      } else {
        registered++;
      }
    }

    log.info({ discovered: discovered.length, registered, skipped }, "Auto-registration complete");

    return NextResponse.json({
      data: { discovered, registered, skipped },
      error: null,
    });
  } catch (err) {
    log.error({ err, rootPath }, "Scan or registration failed");
    return NextResponse.json(
      { data: null, error: "Failed to scan directory" },
      { status: 500 }
    );
  }
}
