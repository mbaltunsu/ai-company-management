"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRateLimit } from "@/hooks/use-github";
import { useGitHubAuth } from "@/hooks/use-auth";
import {
  Github,
  Database,
  FolderOpen,
  Palette,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppSettings } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "github" | "database" | "projects" | "appearance";

interface ConnectionStatus {
  state: "idle" | "testing" | "ok" | "error";
  message: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: Array<{ id: Section; label: string; icon: React.ElementType }> = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "database", label: "Database", icon: Database },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 30000, label: "30s" },
  { value: 60000, label: "1m" },
  { value: 300000, label: "5m" },
  { value: 600000, label: "10m" },
];

const DEFAULTS: AppSettings = {
  githubToken: "",
  githubOwner: "",
  scanDirectories: [],
  logLevel: "info",
  refreshInterval: 60000,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskSecret(value: string, visibleChars = 4): string {
  if (!value) return "";
  const visible = value.slice(-visibleChars);
  return `${"•".repeat(Math.max(0, value.length - visibleChars))}${visible}`;
}

const inputClass =
  "bg-surface-container-high border-[#1f1f23] text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

// ─── Status indicator (used by DatabaseSection) ───────────────────────────────

function StatusDot({ status }: { status: ConnectionStatus }) {
  if (status.state === "idle") return null;
  if (status.state === "testing") {
    return <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />;
  }
  if (status.state === "ok") {
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  }
  return <XCircle className="h-4 w-4 text-red-400" />;
}

// ─── Section: GitHub ─────────────────────────────────────────────────────────

function GitHubSection({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}) {
  const { isConnected, isLoading, user, signIn, signOut } = useGitHubAuth();
  const { data: rateLimit } = useRateLimit();

  const ratePct = rateLimit
    ? Math.round((rateLimit.remaining / rateLimit.limit) * 100)
    : null;

  const resetTime = rateLimit
    ? new Date(rateLimit.resetAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Connection card */}
      <div className="rounded-xl bg-surface-container p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-md font-semibold text-on-background">Connection</p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              GitHub OAuth — sign in to connect your account
            </p>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-success" : "bg-on-surface-dim"
                )}
              />
              <span
                className={cn(
                  "text-label-sm",
                  isConnected ? "text-success" : "text-on-surface-dim"
                )}
              >
                {isConnected ? "Connected" : "Not connected"}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-14 rounded-lg" />
        ) : isConnected && user ? (
          /* Connected state */
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-high border border-[#1f1f23] px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.login}
                className="h-9 w-9 rounded-full border border-[#1f1f23] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-body-md font-semibold text-on-background truncate">
                  {user.name || user.login}
                </p>
                <p className="text-label-sm font-mono text-on-surface-variant truncate">
                  @{user.login}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="shrink-0 border border-[#1f1f23] text-on-surface-variant hover:text-red-400 hover:border-red-400/40"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          /* Disconnected state */
          <Button
            onClick={signIn}
            className="gap-2 bg-primary text-white hover:bg-primary/90"
          >
            <Github className="h-4 w-4" />
            Connect GitHub
          </Button>
        )}

        {/* Rate limit — shown only when connected */}
        {isConnected && rateLimit && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">API Rate Limit</span>
              <span className="text-label-sm font-mono text-on-surface-dim">
                {rateLimit.remaining.toLocaleString()} / {rateLimit.limit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={ratePct ?? 0}
              className="h-1.5 bg-surface-container-high"
            />
            <p className="text-label-sm text-on-surface-dim">
              Resets at {resetTime}
            </p>
          </div>
        )}
      </div>

      {/* Sync card */}
      <div className="rounded-xl bg-surface-container p-5 space-y-3">
        <div>
          <p className="text-body-md font-semibold text-on-background">Sync</p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            Auto-refresh interval for GitHub data
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ refreshInterval: opt.value })}
              className={cn(
                "px-4 py-1.5 rounded-lg border text-label-sm font-mono transition-colors",
                settings.refreshInterval === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#1f1f23] text-on-surface-variant hover:border-primary/50 hover:text-on-background"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-label-sm font-mono text-on-surface-dim">
          Current: every{" "}
          {INTERVAL_OPTIONS.find((o) => o.value === settings.refreshInterval)?.label ??
            `${settings.refreshInterval / 1000}s`}
        </p>
      </div>
    </div>
  );
}

// ─── Section: Database ────────────────────────────────────────────────────────

function DatabaseSection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const [dbStatus, setDbStatus] = useState<ConnectionStatus>({ state: "idle", message: null });

  async function testDb() {
    setDbStatus({ state: "testing", message: null });
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setDbStatus({ state: "ok", message: "Supabase reachable" });
      } else {
        setDbStatus({ state: "error", message: `HTTP ${res.status}` });
      }
    } catch {
      setDbStatus({ state: "error", message: "Connection failed" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-container p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-md font-semibold text-on-background">Supabase</p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              Primary database connection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={dbStatus} />
            {dbStatus.message && (
              <span
                className={cn(
                  "text-label-sm",
                  dbStatus.state === "ok" ? "text-success" : "text-red-400"
                )}
              >
                {dbStatus.message}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-label-sm text-on-surface-variant">URL</label>
          <div className="rounded-lg bg-surface-container-high border border-[#1f1f23] px-3 py-2">
            <p className="text-label-sm font-mono text-on-surface-dim truncate">
              {supabaseUrl
                ? maskSecret(supabaseUrl, 20)
                : "NEXT_PUBLIC_SUPABASE_URL not set"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={testDb}
          disabled={dbStatus.state === "testing"}
          className="border border-[#1f1f23] text-on-surface-variant hover:text-on-background gap-2"
        >
          {dbStatus.state === "testing" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Test Connection
        </Button>
      </div>

      <div className="rounded-xl bg-surface-container p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-label-sm text-on-surface-variant">
          Database credentials are managed via environment variables. Update{" "}
          <span className="font-mono text-on-background">.env.local</span> to change connection settings.
        </p>
      </div>
    </div>
  );
}

// ─── Section: Projects ────────────────────────────────────────────────────────

function ProjectsSection({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}) {
  const [newDir, setNewDir] = useState("");
  const [scanning, setScanning] = useState(false);

  function addDirectory() {
    const trimmed = newDir.trim();
    if (!trimmed) return;
    if (settings.scanDirectories.includes(trimmed)) return;
    onChange({ scanDirectories: [...settings.scanDirectories, trimmed] });
    setNewDir("");
  }

  function removeDirectory(dir: string) {
    onChange({
      scanDirectories: settings.scanDirectories.filter((d) => d !== dir),
    });
  }

  async function scanNow() {
    if (settings.scanDirectories.length === 0) return;
    setScanning(true);
    try {
      await Promise.all(
        settings.scanDirectories.map((dir) =>
          fetch("/api/projects/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rootPath: dir }),
          })
        )
      );
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-container p-5 space-y-4">
        <div>
          <p className="text-body-md font-semibold text-on-background">Scan Directories</p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            Directories to scan for Claude Code projects
          </p>
        </div>

        {/* List */}
        {settings.scanDirectories.length > 0 ? (
          <div className="space-y-2">
            {settings.scanDirectories.map((dir) => (
              <div
                key={dir}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-high border border-[#1f1f23] px-3 py-2"
              >
                <span className="text-label-sm font-mono text-on-surface-variant truncate">
                  {dir}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-on-surface-dim hover:text-red-400"
                  onClick={() => removeDirectory(dir)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-label-sm text-on-surface-dim">No directories configured.</p>
        )}

        {/* Add new */}
        <div className="flex gap-2">
          <Input
            value={newDir}
            onChange={(e) => setNewDir(e.target.value)}
            placeholder="/Users/you/projects"
            className={cn(inputClass, "font-mono flex-1")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDirectory();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="border border-[#1f1f23] text-on-surface-variant hover:text-on-background h-10 w-10 shrink-0"
            onClick={addDirectory}
            aria-label="Add directory"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={scanNow}
          disabled={scanning || settings.scanDirectories.length === 0}
          className="border border-[#1f1f23] text-on-surface-variant hover:text-on-background gap-2"
        >
          {scanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {scanning ? "Scanning…" : "Scan Now"}
        </Button>
      </div>
    </div>
  );
}

// ─── Section: Appearance ──────────────────────────────────────────────────────

function AppearanceSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-surface-container p-5 space-y-4">
        <div>
          <p className="text-body-md font-semibold text-on-background">Theme</p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            Color scheme for the dashboard
          </p>
        </div>

        <div className="flex gap-3">
          {/* Dark mode — active */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-20 h-14 rounded-lg border-2 border-primary bg-[#0f0f11] flex items-end p-1.5 gap-1 cursor-default"
              )}
            >
              <div className="h-2 w-2 rounded-sm bg-primary/60" />
              <div className="h-3 flex-1 rounded-sm bg-surface-container" />
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-label-sm text-primary font-medium">Dark</span>
            </div>
          </div>

          {/* Light mode — coming soon */}
          <div className="flex flex-col items-center gap-2 opacity-40 cursor-not-allowed">
            <div className="w-20 h-14 rounded-lg border-2 border-[#1f1f23] bg-zinc-100 flex items-end p-1.5 gap-1">
              <div className="h-2 w-2 rounded-sm bg-indigo-400/60" />
              <div className="h-3 flex-1 rounded-sm bg-white" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-label-sm text-on-surface-dim">Light</span>
              <span className="text-label-sm text-on-surface-dim">(soon)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container p-5 space-y-3">
        <div>
          <p className="text-body-md font-semibold text-on-background">Accent Color</p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            Primary interactive color
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="h-8 w-8 rounded-lg bg-primary border border-primary/30"
            aria-label="Indigo accent"
          />
          <div>
            <p className="text-body-md text-on-background font-mono">#6366f1</p>
            <p className="text-label-sm text-on-surface-variant">Indigo — default</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("github");
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setSettings(json.data as AppSettings);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function patchSettings(patch: Partial<AppSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaveStatus("idle");
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setSettings(json.data as AppSettings);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings(DEFAULTS);
    setSaveStatus("idle");
  }

  return (
    <>
      <Header title="Settings" />

      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ── Sidebar nav ──────────────────────────────────────── */}
        <nav className="w-[200px] shrink-0 border-r border-[#1f1f23] p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md transition-colors",
                  active
                    ? "border-l-2 border-primary pl-[10px] bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:text-on-background hover:bg-surface-container"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ── Content area ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Section heading */}
            <div>
              <h2 className="text-headline-sm text-on-background">
                {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[180px] rounded-xl" />
                <Skeleton className="h-[100px] rounded-xl" />
              </div>
            ) : (
              <>
                {activeSection === "github" && (
                  <GitHubSection settings={settings} onChange={patchSettings} />
                )}
                {activeSection === "database" && <DatabaseSection />}
                {activeSection === "projects" && (
                  <ProjectsSection settings={settings} onChange={patchSettings} />
                )}
                {activeSection === "appearance" && <AppearanceSection />}
              </>
            )}

            {/* Save / Reset controls */}
            {!loading && activeSection !== "database" && activeSection !== "appearance" && (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-white hover:bg-primary/90 gap-2"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  disabled={saving}
                  className="text-on-surface-variant hover:text-on-background border border-[#1f1f23]"
                >
                  Reset to Defaults
                </Button>
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1.5 text-label-sm text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Saved
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="flex items-center gap-1.5 text-label-sm text-red-400">
                    <XCircle className="h-3.5 w-3.5" />
                    Failed to save
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
