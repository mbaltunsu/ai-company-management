"use client";

import { useState, useEffect, useCallback } from "react";
import { THEMES, COLOR_SWATCHES, applyTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_THEME_ID = "codeops-theme-id";
const STORAGE_PRIMARY = "codeops-primary-color";
const STORAGE_SECONDARY = "codeops-secondary-color";

const DEFAULT_THEME_ID = "obsidian-dark";
const DEFAULT_PRIMARY = COLOR_SWATCHES[0].hsl; // Indigo
const DEFAULT_SECONDARY = "";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  const [currentThemeId, setCurrentThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColorState] = useState<string>(DEFAULT_SECONDARY);
  const [mounted, setMounted] = useState(false);

  // Read persisted values and apply on mount
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_THEME_ID) ?? DEFAULT_THEME_ID;
    const savedPrimary = localStorage.getItem(STORAGE_PRIMARY) ?? DEFAULT_PRIMARY;
    const savedSecondary = localStorage.getItem(STORAGE_SECONDARY) ?? DEFAULT_SECONDARY;

    const theme = THEMES.find((t) => t.id === savedId) ?? THEMES[0];

    setCurrentThemeId(theme.id);
    setPrimaryColorState(savedPrimary);
    setSecondaryColorState(savedSecondary);

    applyTheme(theme, savedPrimary || undefined, savedSecondary || undefined);
    setMounted(true);
  }, []);

  const currentTheme: ThemeConfig =
    THEMES.find((t) => t.id === currentThemeId) ?? THEMES[0];

  const setTheme = useCallback(
    (themeOrId: ThemeConfig | string) => {
      const theme =
        typeof themeOrId === "string"
          ? (THEMES.find((t) => t.id === themeOrId) ?? THEMES[0])
          : themeOrId;

      setCurrentThemeId(theme.id);
      localStorage.setItem(STORAGE_THEME_ID, theme.id);
      applyTheme(theme, primaryColor || undefined, secondaryColor || undefined);
    },
    [primaryColor, secondaryColor]
  );

  const setPrimaryColor = useCallback(
    (hsl: string) => {
      setPrimaryColorState(hsl);
      localStorage.setItem(STORAGE_PRIMARY, hsl);
      applyTheme(currentTheme, hsl || undefined, secondaryColor || undefined);
    },
    [currentTheme, secondaryColor]
  );

  const setSecondaryColor = useCallback(
    (hsl: string) => {
      setSecondaryColorState(hsl);
      localStorage.setItem(STORAGE_SECONDARY, hsl);
      applyTheme(currentTheme, primaryColor || undefined, hsl || undefined);
    },
    [currentTheme, primaryColor]
  );

  return {
    mounted,
    currentTheme,
    setTheme,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    themes: THEMES,
  };
}
