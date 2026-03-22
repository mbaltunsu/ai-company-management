import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { updateSettingsSchema } from "@/lib/validators";
import type { ApiResult, AppSettings } from "@/types";

const SETTINGS_KEYS = [
  "githubToken",
  "githubOwner",
  "scanDirectories",
  "logLevel",
  "refreshInterval",
] as const;

const DEFAULTS: AppSettings = {
  githubToken: "",
  githubOwner: "",
  scanDirectories: [],
  logLevel: "info",
  refreshInterval: 60000,
};

async function readSettings(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", SETTINGS_KEYS);

  if (error || !data) return { ...DEFAULTS };

  const map = Object.fromEntries(
    (data as Array<{ key: string; value: string }>).map((r) => [r.key, r.value])
  );

  return {
    githubToken: typeof map.githubToken === "string" ? map.githubToken : DEFAULTS.githubToken,
    githubOwner: typeof map.githubOwner === "string" ? map.githubOwner : DEFAULTS.githubOwner,
    scanDirectories: map.scanDirectories
      ? (JSON.parse(map.scanDirectories) as string[])
      : DEFAULTS.scanDirectories,
    logLevel: typeof map.logLevel === "string" ? map.logLevel : DEFAULTS.logLevel,
    refreshInterval: map.refreshInterval
      ? Number(map.refreshInterval)
      : DEFAULTS.refreshInterval,
  };
}

// GET /api/settings
export async function GET(): Promise<NextResponse<ApiResult<AppSettings>>> {
  const log = createRequestLogger("GET /api/settings");

  try {
    const supabase = await createClient();
    const settings = await readSettings(supabase);
    log.info("Settings fetched");
    return NextResponse.json({ data: settings, error: null });
  } catch (err) {
    log.error({ err }, "Failed to fetch settings");
    return NextResponse.json(
      { data: null, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResult<AppSettings>>> {
  const log = createRequestLogger("PATCH /api/settings");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    log.warn("Failed to parse request body");
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, "Validation failed");
    return NextResponse.json(
      { data: null, error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Build upsert rows for each provided key
    const rows: Array<{ key: string; value: string }> = [];

    if (parsed.data.githubToken !== undefined) {
      rows.push({ key: "githubToken", value: parsed.data.githubToken });
    }
    if (parsed.data.githubOwner !== undefined) {
      rows.push({ key: "githubOwner", value: parsed.data.githubOwner });
    }
    if (parsed.data.scanDirectories !== undefined) {
      rows.push({
        key: "scanDirectories",
        value: JSON.stringify(parsed.data.scanDirectories),
      });
    }
    if (parsed.data.logLevel !== undefined) {
      rows.push({ key: "logLevel", value: parsed.data.logLevel });
    }
    if (parsed.data.refreshInterval !== undefined) {
      rows.push({
        key: "refreshInterval",
        value: String(parsed.data.refreshInterval),
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from("app_settings")
        .upsert(rows, { onConflict: "key" });

      if (error) {
        log.error({ err: error }, "Failed to upsert settings");
        return NextResponse.json(
          { data: null, error: "Failed to save settings" },
          { status: 500 }
        );
      }
    }

    const updated = await readSettings(supabase);
    log.info({ keys: rows.map((r) => r.key) }, "Settings updated");

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    log.error({ err }, "Unexpected error updating settings");
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
