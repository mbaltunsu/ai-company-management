import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import type { ApiResult } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

// DELETE /api/libraries/[id]
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResult<{ deleted: true }>>> {
  const { id } = await context.params;
  const log = createRequestLogger(`DELETE /api/libraries/${id}`);

  try {
    const supabase = await createClient();

    // Fetch the library first to guard against deleting defaults
    const { data: existing, error: fetchError } = await supabase
      .from("agent_libraries")
      .select("id, is_default")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      log.warn({ id }, "Library not found");
      return NextResponse.json(
        { data: null, error: "Library not found" },
        { status: 404 }
      );
    }

    if (existing.is_default) {
      log.warn({ id }, "Attempted to delete a default library");
      return NextResponse.json(
        { data: null, error: "Default libraries cannot be deleted" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("agent_libraries")
      .delete()
      .eq("id", id);

    if (error) {
      log.error({ err: error, id }, "Failed to delete library");
      return NextResponse.json(
        { data: null, error: "Failed to delete library" },
        { status: 500 }
      );
    }

    log.info({ id }, "Library deleted");
    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error deleting library");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
