// ─── Theme System — Stitch Design Language ────────────────────────────────────

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
  /** Hex values for preview rendering (not applied to CSS) */
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

export const THEMES: ThemeConfig[] = [
  // 1. Obsidian Dark (default)
  {
    id: "obsidian-dark",
    name: "Obsidian Dark",
    mode: "dark",
    preview: {
      bg: "#0a0a0b",
      sidebar: "#0f0f11",
      card: "#111114",
      accent: "#6366f1",
      text: "#f7f7f8",
      border: "#1f1f23",
    },
    colors: {
      background: "240 6% 4%",
      foreground: "0 0% 97%",
      card: "240 5% 7%",
      cardForeground: "0 0% 97%",
      popover: "240 5% 7%",
      popoverForeground: "0 0% 97%",
      primary: "239 84% 67%",
      primaryForeground: "0 0% 97%",
      secondary: "240 6% 12%",
      secondaryForeground: "0 0% 97%",
      muted: "240 3% 13%",
      mutedForeground: "240 5% 67%",
      accent: "240 3% 13%",
      accentForeground: "0 0% 97%",
      destructive: "0 63% 31%",
      destructiveForeground: "0 0% 97%",
      border: "240 6% 12%",
      input: "240 6% 12%",
      ring: "239 84% 67%",
      sidebar: "240 6% 4%",
      sidebarForeground: "0 0% 89%",
      sidebarBorder: "240 6% 12%",
      sidebarAccent: "239 84% 67%",
      sidebarAccentForeground: "0 0% 97%",
    },
  },

  // 2. Midnight Blue
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    mode: "dark",
    preview: {
      bg: "#0b0e14",
      sidebar: "#0d1117",
      card: "#111827",
      accent: "#3b82f6",
      text: "#f1f5f9",
      border: "#1e2a3a",
    },
    colors: {
      background: "222 26% 6%",
      foreground: "210 40% 96%",
      card: "217 33% 10%",
      cardForeground: "210 40% 96%",
      popover: "217 33% 10%",
      popoverForeground: "210 40% 96%",
      primary: "217 91% 60%",
      primaryForeground: "0 0% 98%",
      secondary: "215 28% 14%",
      secondaryForeground: "210 40% 96%",
      muted: "215 25% 15%",
      mutedForeground: "215 20% 60%",
      accent: "215 25% 15%",
      accentForeground: "210 40% 96%",
      destructive: "0 63% 31%",
      destructiveForeground: "0 0% 98%",
      border: "215 28% 14%",
      input: "215 28% 14%",
      ring: "217 91% 60%",
      sidebar: "222 26% 5%",
      sidebarForeground: "210 35% 85%",
      sidebarBorder: "215 28% 13%",
      sidebarAccent: "217 91% 60%",
      sidebarAccentForeground: "0 0% 98%",
    },
  },

  // 3. Forest Dark
  {
    id: "forest-dark",
    name: "Forest Dark",
    mode: "dark",
    preview: {
      bg: "#0b100e",
      sidebar: "#0e1410",
      card: "#121a14",
      accent: "#10b981",
      text: "#ecfdf5",
      border: "#1a2e22",
    },
    colors: {
      background: "155 25% 6%",
      foreground: "152 78% 97%",
      card: "153 22% 9%",
      cardForeground: "152 78% 97%",
      popover: "153 22% 9%",
      popoverForeground: "152 78% 97%",
      primary: "160 84% 39%",
      primaryForeground: "0 0% 98%",
      secondary: "155 20% 13%",
      secondaryForeground: "152 78% 97%",
      muted: "155 18% 14%",
      mutedForeground: "155 15% 60%",
      accent: "155 18% 14%",
      accentForeground: "152 78% 97%",
      destructive: "0 63% 31%",
      destructiveForeground: "0 0% 98%",
      border: "155 20% 13%",
      input: "155 20% 13%",
      ring: "160 84% 39%",
      sidebar: "155 25% 5%",
      sidebarForeground: "152 50% 85%",
      sidebarBorder: "155 20% 12%",
      sidebarAccent: "160 84% 39%",
      sidebarAccentForeground: "0 0% 98%",
    },
  },

  // 4. Obsidian Light
  {
    id: "obsidian-light",
    name: "Obsidian Light",
    mode: "light",
    preview: {
      bg: "#fafafa",
      sidebar: "#f4f4f6",
      card: "#ffffff",
      accent: "#6366f1",
      text: "#09090b",
      border: "#e4e4e7",
    },
    colors: {
      background: "0 0% 98%",
      foreground: "240 10% 4%",
      card: "0 0% 100%",
      cardForeground: "240 10% 4%",
      popover: "0 0% 100%",
      popoverForeground: "240 10% 4%",
      primary: "239 84% 67%",
      primaryForeground: "0 0% 98%",
      secondary: "240 5% 94%",
      secondaryForeground: "240 10% 4%",
      muted: "240 5% 94%",
      mutedForeground: "240 4% 46%",
      accent: "240 5% 94%",
      accentForeground: "240 10% 4%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 98%",
      border: "240 6% 90%",
      input: "240 6% 90%",
      ring: "239 84% 67%",
      sidebar: "240 5% 95%",
      sidebarForeground: "240 10% 20%",
      sidebarBorder: "240 6% 88%",
      sidebarAccent: "239 84% 67%",
      sidebarAccentForeground: "0 0% 98%",
    },
  },

  // 5. Snow Blue
  {
    id: "snow-blue",
    name: "Snow Blue",
    mode: "light",
    preview: {
      bg: "#f8fafc",
      sidebar: "#f1f5f9",
      card: "#ffffff",
      accent: "#3b82f6",
      text: "#0f172a",
      border: "#e2e8f0",
    },
    colors: {
      background: "210 40% 98%",
      foreground: "222 47% 11%",
      card: "0 0% 100%",
      cardForeground: "222 47% 11%",
      popover: "0 0% 100%",
      popoverForeground: "222 47% 11%",
      primary: "217 91% 60%",
      primaryForeground: "0 0% 98%",
      secondary: "210 40% 93%",
      secondaryForeground: "222 47% 11%",
      muted: "210 40% 93%",
      mutedForeground: "215 20% 46%",
      accent: "210 40% 93%",
      accentForeground: "222 47% 11%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 98%",
      border: "214 32% 89%",
      input: "214 32% 89%",
      ring: "217 91% 60%",
      sidebar: "210 40% 95%",
      sidebarForeground: "222 35% 25%",
      sidebarBorder: "214 32% 87%",
      sidebarAccent: "217 91% 60%",
      sidebarAccentForeground: "0 0% 98%",
    },
  },

  // 6. Sage Light
  {
    id: "sage-light",
    name: "Sage Light",
    mode: "light",
    preview: {
      bg: "#f5f7f5",
      sidebar: "#eef2ee",
      card: "#ffffff",
      accent: "#10b981",
      text: "#0f1f17",
      border: "#d1e0d5",
    },
    colors: {
      background: "120 12% 96%",
      foreground: "150 42% 10%",
      card: "0 0% 100%",
      cardForeground: "150 42% 10%",
      popover: "0 0% 100%",
      popoverForeground: "150 42% 10%",
      primary: "160 84% 39%",
      primaryForeground: "0 0% 98%",
      secondary: "120 12% 91%",
      secondaryForeground: "150 42% 10%",
      muted: "120 12% 91%",
      mutedForeground: "140 12% 45%",
      accent: "120 12% 91%",
      accentForeground: "150 42% 10%",
      destructive: "0 84% 60%",
      destructiveForeground: "0 0% 98%",
      border: "140 20% 84%",
      input: "140 20% 84%",
      ring: "160 84% 39%",
      sidebar: "120 14% 93%",
      sidebarForeground: "150 30% 20%",
      sidebarBorder: "140 20% 82%",
      sidebarAccent: "160 84% 39%",
      sidebarAccentForeground: "0 0% 98%",
    },
  },
];

// ─── Color Swatches ───────────────────────────────────────────────────────────

export interface ColorSwatch {
  name: string;
  hex: string;
  hsl: string; // HSL string for CSS variable (no "hsl()" wrapper)
}

export const COLOR_SWATCHES: ColorSwatch[] = [
  { name: "Indigo", hex: "#6366f1", hsl: "239 84% 67%" },
  { name: "Blue", hex: "#3b82f6", hsl: "217 91% 60%" },
  { name: "Emerald", hex: "#10b981", hsl: "160 84% 39%" },
  { name: "Amber", hex: "#f59e0b", hsl: "38 92% 50%" },
  { name: "Rose", hex: "#f43f5e", hsl: "350 89% 60%" },
  { name: "Violet", hex: "#8b5cf6", hsl: "258 90% 66%" },
  { name: "Cyan", hex: "#06b6d4", hsl: "192 91% 43%" },
  { name: "Orange", hex: "#f97316", hsl: "25 95% 53%" },
];

// ─── Apply Theme ──────────────────────────────────────────────────────────────

/**
 * Writes all CSS custom properties onto <html> and toggles the `.dark` class.
 * Accepts optional HSL string overrides for primary and secondary colors.
 */
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

  // Apply all CSS variables
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
