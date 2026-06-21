import type { CSSProperties } from "react";
import { paperTheme } from "@/themes/paper";
import { workbenchTheme } from "@/themes/workbench";
import type { BlogTheme, ThemeTokens } from "@/lib/themes/types";
import { getSettings, setSettings } from "@/lib/settings";

export const themes: BlogTheme[] = [workbenchTheme, paperTheme];

export function listThemes() {
  return themes.map((theme) => theme.config);
}

export function getTheme(id?: string) {
  return themes.find((theme) => theme.config.id === id) || workbenchTheme;
}

export function getActiveTheme() {
  return getTheme(getSettings().activeTheme);
}

export function setActiveTheme(id: string) {
  if (!themes.some((theme) => theme.config.id === id)) {
    throw new Error("Theme not found");
  }
  setSettings({ activeTheme: id });
}

export function tokensToCssVars(tokens: ThemeTokens) {
  return {
    "--bg": tokens.background,
    "--fg": tokens.foreground,
    "--muted": tokens.muted,
    "--surface": tokens.surface,
    "--border": tokens.border,
    "--accent": tokens.accent,
    "--accent-soft": tokens.accentSoft,
    "--code-bg": tokens.codeBg,
    "--font-sans": tokens.fontSans,
    "--font-serif": tokens.fontSerif,
    "--font-mono": tokens.fontMono
  } as CSSProperties;
}
