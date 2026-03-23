"use client";

import { useTheme } from "@/hooks/use-theme";

/**
 * Mounts the saved theme from localStorage on the client before first paint.
 * Rendered inside RootLayout so it runs on every page.
 * No visible output — pure side-effect component.
 */
export function ThemeInitializer() {
  useTheme();
  return null;
}
