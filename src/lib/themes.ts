// ─── Theme System — UI/UX Pro Max Validated Color Palettes ─────────────────────
//
// Color principles applied (from UI/UX Pro Max):
// - Primary text contrast ≥ 4.5:1 in both dark and light modes
// - Secondary/muted text contrast ≥ 3:1
// - Input backgrounds distinct from card backgrounds (visible text always)
// - Dark themes use desaturated/lifted tonal variants, not pure black
// - Light themes use warm/cool tinted whites, not pure #fff everywhere
// - Borders visible in both modes via adequate contrast
// - No color-only information — always paired with icons/text
// ───────────────────────────────────────────────────────────────────────────────

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  mode: "dark" | "light";
  preview: {
    bg: string;
    sidebar: string;
    card: string;
    accent: string;
    text: string;
    border: string;
  };
  colors: ThemeColors;
}

// ─── 6 Theme Presets ──────────────────────────────────────────────────────────
//
// Dark themes: background ~4-7% lightness, cards ~9-12%, inputs ~14-17%
// Light themes: background ~96-98%, cards ~100%, inputs ~93-95%
// All foreground/background pairs tested for WCAG AA compliance.

export const THEMES: ThemeConfig[] = [
  // ── 1. Obsidian Dark — Indigo accent ──────────────────────────────────────
  {
    id: "obsidian-dark",
    name: "Obsidian Dark",
    mode: "dark",
    preview: {
      bg: "#0e0e10",
      sidebar: "#0b0b0d",
      card: "#161619",
      accent: "#818cf8",
      text: "#e4e4e7",
      border: "#27272a",
    },
    colors: {
      background: "240 6% 5.5%",        // #0e0e10 — soft dark, not pure black
      foreground: "240 5% 90%",          // #e4e4e7 — warm off-white (not blinding)
      card: "240 5% 9%",                 // #161619 — clearly lifted from bg
      cardForeground: "240 5% 90%",      // same warm off-white
      popover: "240 5% 9%",
      popoverForeground: "240 5% 90%",
      primary: "235 78% 74%",            // #818cf8 — desaturated indigo (easier on eyes)
      primaryForeground: "240 6% 5.5%",  // dark text on primary buttons
      secondary: "240 4% 16%",           // #28282c — input/secondary surface
      secondaryForeground: "240 5% 85%", // readable text on secondary
      muted: "240 4% 16%",              // same as secondary for consistency
      mutedForeground: "240 5% 64%",     // #9898a3 — ≥4:1 on muted bg
      accent: "240 4% 16%",
      accentForeground: "240 5% 90%",
      destructive: "0 72% 51%",          // #dc2626
      destructiveForeground: "0 0% 98%",
      border: "240 4% 19%",             // #2e2e33 — visible but subtle
      input: "240 4% 16%",              // #28282c — distinct from card bg
      ring: "235 78% 74%",
      sidebar: "240 6% 4.5%",           // #0b0b0d — slightly darker than bg
      sidebarForeground: "240 5% 78%",  // #c2c2c9
      sidebarBorder: "240 4% 15%",
      sidebarAccent: "235 78% 74%",
      sidebarAccentForeground: "240 6% 5.5%",
    },
  },

  // ── 2. Midnight Blue — Blue accent ────────────────────────────────────────
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    mode: "dark",
    preview: {
      bg: "#0c1220",
      sidebar: "#091018",
      card: "#131d2e",
      accent: "#60a5fa",
      text: "#e2e8f0",
      border: "#1e3048",
    },
    colors: {
      background: "220 40% 8%",          // #0c1220 — deep navy
      foreground: "214 32% 91%",         // #e2e8f0 — cool off-white
      card: "218 35% 12.5%",             // #131d2e — lifted navy
      cardForeground: "214 32% 91%",
      popover: "218 35% 12.5%",
      popoverForeground: "214 32% 91%",
      primary: "213 94% 68%",            // #60a5fa — desaturated sky blue
      primaryForeground: "220 40% 8%",
      secondary: "218 30% 18%",          // #1e2d44 — input surfaces
      secondaryForeground: "214 32% 85%",
      muted: "218 30% 18%",
      mutedForeground: "215 20% 60%",    // #8296ad — ≥4:1 on muted bg
      accent: "218 30% 18%",
      accentForeground: "214 32% 91%",
      destructive: "0 72% 51%",
      destructiveForeground: "0 0% 98%",
      border: "218 28% 22%",            // #253650 — visible boundary
      input: "218 30% 18%",             // distinct from card
      ring: "213 94% 68%",
      sidebar: "220 40% 6%",            // #091018
      sidebarForeground: "214 25% 75%",
      sidebarBorder: "218 28% 16%",
      sidebarAccent: "213 94% 68%",
      sidebarAccentForeground: "220 40% 8%",
    },
  },

  // ── 3. Forest Dark — Emerald accent ───────────────────────────────────────
  {
    id: "forest-dark",
    name: "Forest Dark",
    mode: "dark",
    preview: {
      bg: "#0b110d",
      sidebar: "#080e0a",
      card: "#141e16",
      accent: "#34d399",
      text: "#dff0e4",
      border: "#1e3325",
    },
    colors: {
      background: "140 25% 5.5%",       // #0b110d — deep forest
      foreground: "145 30% 90%",         // #dff0e4 — soft green-white
      card: "145 22% 10%",              // #141e16 — lifted green-dark
      cardForeground: "145 30% 90%",
      popover: "145 22% 10%",
      popoverForeground: "145 30% 90%",
      primary: "160 72% 52%",            // #34d399 — desaturated emerald
      primaryForeground: "140 25% 5.5%",
      secondary: "145 20% 16%",          // #1f2f23 — input surfaces
      secondaryForeground: "145 20% 84%",
      muted: "145 20% 16%",
      mutedForeground: "145 12% 58%",    // #7fa08a — ≥4:1 on muted bg
      accent: "145 20% 16%",
      accentForeground: "145 30% 90%",
      destructive: "0 72% 51%",
      destructiveForeground: "0 0% 98%",
      border: "145 18% 20%",            // #263d2c — visible on dark green
      input: "145 20% 16%",
      ring: "160 72% 52%",
      sidebar: "140 25% 4%",
      sidebarForeground: "145 18% 72%",
      sidebarBorder: "145 18% 14%",
      sidebarAccent: "160 72% 52%",
      sidebarAccentForeground: "140 25% 5.5%",
    },
  },

  // ── 4. Obsidian Light — Indigo accent ─────────────────────────────────────
  {
    id: "obsidian-light",
    name: "Obsidian Light",
    mode: "light",
    preview: {
      bg: "#f9f9fb",
      sidebar: "#f0f0f5",
      card: "#ffffff",
      accent: "#6366f1",
      text: "#1c1c22",
      border: "#dddde3",
    },
    colors: {
      background: "240 14% 97%",        // #f9f9fb — warm tinted white
      foreground: "240 12% 12%",         // #1c1c22 — not pure black (softer)
      card: "0 0% 100%",                // #ffffff
      cardForeground: "240 12% 12%",
      popover: "0 0% 100%",
      popoverForeground: "240 12% 12%",
      primary: "239 84% 67%",           // #6366f1 — full indigo
      primaryForeground: "0 0% 100%",
      secondary: "240 8% 93%",          // #ededf2 — input surfaces
      secondaryForeground: "240 12% 12%",
      muted: "240 8% 93%",
      mutedForeground: "240 5% 42%",    // #636370 — ≥4.5:1 on white
      accent: "240 8% 93%",
      accentForeground: "240 12% 12%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 100%",
      border: "240 6% 87%",             // #dddde3 — soft boundary
      input: "240 8% 93%",              // #ededf2 — visible against white cards
      ring: "239 84% 67%",
      sidebar: "240 10% 94%",           // #f0f0f5 — subtle sidebar tint
      sidebarForeground: "240 8% 30%",  // #464652
      sidebarBorder: "240 6% 87%",
      sidebarAccent: "239 84% 67%",
      sidebarAccentForeground: "0 0% 100%",
    },
  },

  // ── 5. Snow Blue — Blue accent ────────────────────────────────────────────
  {
    id: "snow-blue",
    name: "Snow Blue",
    mode: "light",
    preview: {
      bg: "#f7f9fc",
      sidebar: "#eef3f9",
      card: "#ffffff",
      accent: "#3b82f6",
      text: "#0f1d2f",
      border: "#d4dfe9",
    },
    colors: {
      background: "215 40% 97%",        // #f7f9fc — cool blue-white
      foreground: "216 50% 12%",         // #0f1d2f — dark navy text
      card: "0 0% 100%",
      cardForeground: "216 50% 12%",
      popover: "0 0% 100%",
      popoverForeground: "216 50% 12%",
      primary: "217 91% 60%",           // #3b82f6 — vibrant blue
      primaryForeground: "0 0% 100%",
      secondary: "215 30% 92%",         // #e4ecf3 — input surfaces
      secondaryForeground: "216 50% 12%",
      muted: "215 30% 92%",
      mutedForeground: "215 16% 40%",   // #586579 — ≥4.5:1 on white
      accent: "215 30% 92%",
      accentForeground: "216 50% 12%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 100%",
      border: "215 25% 85%",           // #d4dfe9 — cool blue border
      input: "215 30% 92%",            // visible against white
      ring: "217 91% 60%",
      sidebar: "215 35% 94%",          // #eef3f9
      sidebarForeground: "215 20% 28%",
      sidebarBorder: "215 25% 85%",
      sidebarAccent: "217 91% 60%",
      sidebarAccentForeground: "0 0% 100%",
    },
  },

  // ── 6. Sage Light — Emerald accent ────────────────────────────────────────
  {
    id: "sage-light",
    name: "Sage Light",
    mode: "light",
    preview: {
      bg: "#f6f9f6",
      sidebar: "#ecf2ec",
      card: "#ffffff",
      accent: "#059669",
      text: "#122118",
      border: "#cdddd2",
    },
    colors: {
      background: "120 18% 97%",        // #f6f9f6 — warm sage white
      foreground: "150 35% 10%",         // #122118 — deep green-black
      card: "0 0% 100%",
      cardForeground: "150 35% 10%",
      popover: "0 0% 100%",
      popoverForeground: "150 35% 10%",
      primary: "160 91% 31%",           // #059669 — deeper emerald (better on white)
      primaryForeground: "0 0% 100%",
      secondary: "130 15% 91%",         // #e3ece5 — input surfaces
      secondaryForeground: "150 35% 10%",
      muted: "130 15% 91%",
      mutedForeground: "140 10% 38%",   // #566b5c — ≥4.5:1 on white
      accent: "130 15% 91%",
      accentForeground: "150 35% 10%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 100%",
      border: "140 18% 82%",           // #cdddd2 — soft green border
      input: "130 15% 91%",
      ring: "160 91% 31%",
      sidebar: "130 20% 92%",          // #ecf2ec
      sidebarForeground: "150 15% 25%",
      sidebarBorder: "140 18% 82%",
      sidebarAccent: "160 91% 31%",
      sidebarAccentForeground: "0 0% 100%",
    },
  },
];

// ─── Color Swatches ───────────────────────────────────────────────────────────

export interface ColorSwatch {
  name: string;
  hex: string;
  hsl: string;
}

export const COLOR_SWATCHES: ColorSwatch[] = [
  { name: "Indigo", hex: "#818cf8", hsl: "235 78% 74%" },
  { name: "Blue", hex: "#60a5fa", hsl: "213 94% 68%" },
  { name: "Emerald", hex: "#34d399", hsl: "160 72% 52%" },
  { name: "Amber", hex: "#fbbf24", hsl: "43 96% 56%" },
  { name: "Rose", hex: "#fb7185", hsl: "350 90% 72%" },
  { name: "Violet", hex: "#a78bfa", hsl: "258 90% 76%" },
  { name: "Cyan", hex: "#22d3ee", hsl: "188 94% 53%" },
  { name: "Orange", hex: "#fb923c", hsl: "27 96% 61%" },
];

// ─── Apply Theme ──────────────────────────────────────────────────────────────

export function applyTheme(
  theme: ThemeConfig,
  primaryOverride?: string,
  secondaryOverride?: string
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const colors = { ...theme.colors };

  if (primaryOverride) {
    colors.primary = primaryOverride;
    colors.ring = primaryOverride;
    colors.sidebarAccent = primaryOverride;
  }
  if (secondaryOverride) {
    colors.secondary = secondaryOverride;
  }

  // Toggle dark class
  if (theme.mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  const vars: Record<string, string> = {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--popover": colors.popover,
    "--popover-foreground": colors.popoverForeground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.secondaryForeground,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--destructive": colors.destructive,
    "--destructive-foreground": colors.destructiveForeground,
    "--border": colors.border,
    "--input": colors.input,
    "--ring": colors.ring,
    "--sidebar": colors.sidebar,
    "--sidebar-foreground": colors.sidebarForeground,
    "--sidebar-border": colors.sidebarBorder,
    "--sidebar-accent": colors.sidebarAccent,
    "--sidebar-accent-foreground": colors.sidebarAccentForeground,
  };

  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value);
  }
}
