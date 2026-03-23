"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useRateLimit } from "@/hooks/use-github";
import { useGitHubAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useClaudeTest } from "@/hooks/use-claude";
import { COLOR_SWATCHES, THEMES } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";
import {
  Github,
  Palette,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppSettings } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "github" | "appearance" | "claude";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: Array<{ id: Section; label: string; icon: React.ElementType }> = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "claude", label: "Claude Code", icon: Sparkles },
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
                <p className="text-label-sm font-mono text-on-surface-variant truncate selectable">
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
              <span className="text-label-sm font-mono text-on-surface-dim selectable">
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

// ─── Theme Card Mini-Preview ──────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { bg, sidebar, card, accent, border } = theme.preview;

  return (
    <button
      onClick={onSelect}
      aria-label={`Select ${theme.name} theme`}
      aria-pressed={isActive}
      className={cn(
        "group relative flex flex-col items-center gap-2.5 rounded-xl p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive ? "cursor-default" : "cursor-pointer"
      )}
    >
      {/* Mini mockup */}
      <div
        className="w-full rounded-lg overflow-hidden transition-transform group-hover:scale-[1.02]"
        style={{
          aspectRatio: "4 / 2.6",
          border: isActive
            ? `2px solid ${accent}`
            : `2px solid ${border}`,
          background: bg,
        }}
      >
        {/* Inner layout — sidebar + main area */}
        <div className="flex h-full">
          {/* Sidebar strip */}
          <div
            className="flex flex-col gap-1 p-1.5 shrink-0"
            style={{ width: "30%", background: sidebar }}
          >
            {/* Logo placeholder */}
            <div
              className="w-4 h-1.5 rounded-sm mb-1"
              style={{ background: accent }}
            />
            {/* Nav items */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1 rounded-sm"
                style={{
                  background: i === 1 ? accent : card,
                  opacity: i === 1 ? 0.9 : 0.5,
                  width: i === 1 ? "80%" : "65%",
                }}
              />
            ))}
          </div>

          {/* Main content area */}
          <div
            className="flex-1 p-1.5 flex flex-col gap-1"
            style={{ background: bg }}
          >
            {/* Header bar */}
            <div
              className="h-1.5 w-full rounded-sm"
              style={{ background: card, opacity: 0.8 }}
            />
            {/* Content cards */}
            <div className="flex gap-1 flex-1">
              <div
                className="flex-1 rounded-sm"
                style={{ background: card, opacity: 0.7 }}
              />
              <div
                className="flex-1 rounded-sm"
                style={{ background: card, opacity: 0.5 }}
              />
            </div>
            {/* Accent bar */}
            <div
              className="h-1 w-3/4 rounded-sm"
              style={{ background: accent, opacity: 0.7 }}
            />
          </div>
        </div>
      </div>

      {/* Label row */}
      <div className="flex items-center gap-1.5 w-full justify-center">
        {isActive && (
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: theme.preview.accent }}
          />
        )}
        <span
          className={cn(
            "text-label-sm font-medium truncate",
            isActive ? "text-on-background" : "text-on-surface-variant"
          )}
        >
          {theme.name}
        </span>
      </div>

      {/* Active check overlay */}
      {isActive && (
        <span
          className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full"
          style={{ background: theme.preview.accent }}
        >
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─── Color Swatch Row ─────────────────────────────────────────────────────────

function SwatchRow({
  label,
  description,
  selectedHsl,
  onSelect,
}: {
  label: string;
  description: string;
  selectedHsl: string;
  onSelect: (hsl: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-body-md font-semibold text-on-background">{label}</p>
        <p className="text-label-sm text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        {COLOR_SWATCHES.map((swatch) => {
          const isActive = selectedHsl === swatch.hsl;
          return (
            <button
              key={swatch.hsl}
              onClick={() => onSelect(swatch.hsl)}
              aria-label={`${swatch.name} color`}
              aria-pressed={isActive}
              title={swatch.name}
              className={cn(
                "relative h-8 w-8 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
                isActive ? "scale-110" : "hover:scale-105"
              )}
              style={{
                background: swatch.hex,
                boxShadow: isActive
                  ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${swatch.hex}`
                  : undefined,
              }}
            >
              {isActive && (
                <Check
                  className="absolute inset-0 m-auto h-3.5 w-3.5 text-white"
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}

        {/* Active color label */}
        <div className="ml-1">
          <span className="text-label-sm font-mono text-on-surface-variant">
            {COLOR_SWATCHES.find((s) => s.hsl === selectedHsl)?.name ?? "Custom"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Claude Code ─────────────────────────────────────────────────────

function ClaudeSection() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testEnabled, setTestEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const { data: testResult, isLoading: testLoading, isFetching: testFetching } = useClaudeTest(testEnabled);

  // Reset test trigger once result arrives
  useEffect(() => {
    if (testResult !== undefined && !testFetching) {
      setTestEnabled(false);
    }
  }, [testResult, testFetching]);

  // Load existing (masked) key on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.claudeApiKey) {
          setApiKey(json.data.claudeApiKey as string);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claudeApiKey: apiKey }),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function handleTest() {
    setTestEnabled(true);
  }

  const isConnected = testResult?.connected === true;
  const testDone = testResult !== undefined;
  const isTesting = testLoading || testFetching;

  const inputClass =
    "bg-surface-container-high border-[#1f1f23] text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary font-mono";

  return (
    <div className="space-y-4">
      {/* API Key card */}
      <div className="rounded-xl bg-surface-container p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-md font-semibold text-on-background">API Key</p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              Your Anthropic API key — stored securely in the database
            </p>
          </div>
          {testDone && !isTesting && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-success" : "bg-red-400"
                )}
              />
              <span
                className={cn(
                  "text-label-sm",
                  isConnected ? "text-success" : "text-red-400"
                )}
              >
                {isConnected ? "Connected" : "Not configured"}
              </span>
            </div>
          )}
          {!testDone && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-on-surface-dim" />
              <span className="text-label-sm text-on-surface-dim">Not tested</span>
            </div>
          )}
        </div>

        {/* Key input */}
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setSaveStatus("idle");
            }}
            placeholder="sk-ant-..."
            className={cn(inputClass, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-dim hover:text-on-background transition-colors"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            className="bg-primary text-white hover:bg-primary/90 gap-2"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleTest}
            disabled={isTesting || !apiKey.trim()}
            className="border border-[#1f1f23] text-on-surface-variant hover:text-on-background gap-2"
          >
            {isTesting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isTesting ? "Testing…" : "Test Connection"}
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
          {testDone && !isTesting && (
            <span
              className={cn(
                "flex items-center gap-1.5 text-label-sm",
                isConnected ? "text-success" : "text-red-400"
              )}
            >
              {isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {isConnected ? "Connection successful" : "Connection failed"}
            </span>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl bg-surface-container p-5">
        <p className="text-body-md font-semibold text-on-background">About Claude Code Integration</p>
        <ul className="mt-3 space-y-2">
          {[
            "Generate agent suggestions for tasks automatically",
            "Create targeted prompts for your AI agent team",
            "API key is stored in Supabase and never exposed to the browser",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-body-md text-on-surface-variant">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Section: Appearance ──────────────────────────────────────────────────────

function AppearanceSection() {
  const {
    currentTheme,
    setTheme,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    mounted,
  } = useTheme();

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Theme Selector ──────────────────────────────────────── */}
      <div className="rounded-xl bg-surface-container p-5 space-y-4">
        <div>
          <p className="text-body-md font-semibold text-on-background">Theme</p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            Choose a color scheme — changes apply instantly
          </p>
        </div>

        {/* 3-column grid of theme cards */}
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme.id === theme.id}
              onSelect={() => setTheme(theme)}
            />
          ))}
        </div>

        {/* Mode badge */}
        <div className="flex items-center gap-2 pt-1 border-t border-[hsl(var(--border))]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-label-sm font-medium",
              currentTheme.mode === "dark"
                ? "bg-primary/10 text-primary"
                : "bg-primary/10 text-primary"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {currentTheme.mode === "dark" ? "Dark" : "Light"} mode active
          </span>
          <span className="text-label-sm text-on-surface-dim">{currentTheme.name}</span>
        </div>
      </div>

      {/* ── Primary Color ────────────────────────────────────────── */}
      <div className="rounded-xl bg-surface-container p-5">
        <SwatchRow
          label="Primary Color"
          description="Accent color used for active states, buttons, and highlights"
          selectedHsl={primaryColor}
          onSelect={setPrimaryColor}
        />
      </div>

      {/* ── Secondary Color ──────────────────────────────────────── */}
      <div className="rounded-xl bg-surface-container p-5">
        <SwatchRow
          label="Secondary Color"
          description="Used for badges, tags, and secondary interactive elements"
          selectedHsl={secondaryColor || "240 6% 12%"}
          onSelect={setSecondaryColor}
        />
      </div>

      {/* ── Reset notice ─────────────────────────────────────────── */}
      <p className="text-label-sm text-on-surface-dim px-1">
        Theme preferences are saved locally in your browser. No account required.
      </p>
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
        <nav className="w-[200px] shrink-0 border-r border-[hsl(var(--border))] p-4 space-y-1">
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

            {loading && activeSection !== "appearance" && activeSection !== "claude" ? (
              <div className="space-y-4">
                <Skeleton className="h-[180px] rounded-xl" />
                <Skeleton className="h-[100px] rounded-xl" />
              </div>
            ) : (
              <>
                {activeSection === "github" && (
                  <GitHubSection settings={settings} onChange={patchSettings} />
                )}
                {activeSection === "appearance" && <AppearanceSection />}
                {activeSection === "claude" && <ClaudeSection />}
              </>
            )}

            {/* Save / Reset controls — only shown for GitHub section */}
            {!loading && activeSection === "github" && (
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
                  className="text-on-surface-variant hover:text-on-background border border-[hsl(var(--border))]"
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
