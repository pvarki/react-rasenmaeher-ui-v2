import THEME_CONFIG from "virtual-theme-config";
import type { CompleteTheme } from "@/types/theme";

let cachedCompleteTheme: CompleteTheme | null = null;

export function getThemeSync(): CompleteTheme {
  if (cachedCompleteTheme) {
    return cachedCompleteTheme;
  }

  const primaryColor = THEME_CONFIG.variables["primary"] || "#cc66bb";
  const accentColor = THEME_CONFIG.variables["accent"] || "#882255";
  const backgroundColor = THEME_CONFIG.variables["background"] || "#1a1a1a";

  const baseUrl = THEME_CONFIG.baseUrl;
  const assets = {
    logoUrl:
      (THEME_CONFIG.metadata.logo_url as string) ||
      `${baseUrl}/assets/logo.png`,
    shortcutIconUrl:
      (THEME_CONFIG.metadata.icon_192 as string) ||
      `${baseUrl}/icons/icon-192x192.png`,
    appleIconUrl:
      (THEME_CONFIG.metadata.icon_512 as string) ||
      `${baseUrl}/icons/icon-512x512.png`,
    faviconUrl:
      (THEME_CONFIG.metadata.favicon_url as string) ||
      `${baseUrl}/assets/favicon.ico`,
    icon192Url:
      (THEME_CONFIG.metadata.icon_192 as string) ||
      `${baseUrl}/icons/icon-192x192.png`,
    icon512Url:
      (THEME_CONFIG.metadata.icon_512 as string) ||
      `${baseUrl}/icons/icon-512x512.png`,
    ASSETS_DIR:
      (THEME_CONFIG.metadata.ASSETS_DIR as string) || `${baseUrl}/assets/`,
  };

  const completeTheme: CompleteTheme = {
    id: THEME_CONFIG.id,
    name: THEME_CONFIG.name,
    subName: THEME_CONFIG.short_name || THEME_CONFIG.description,
    primaryColor,
    accentColor,
    backgroundColor,
    assets,
    metadata: THEME_CONFIG.metadata,
    variables: THEME_CONFIG.variables,
    localization: THEME_CONFIG.localization,
  };

  cachedCompleteTheme = completeTheme;
  return completeTheme;
}

export function getTheme(): CompleteTheme {
  return getThemeSync();
}

export function applyThemeVariables() {
  const root = document.documentElement;
  const variables = getTheme().variables;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value as string);
  });
}

let runtimeLocalization: Record<string, unknown> = {};

export function setRuntimeLocalization(localization: Record<string, unknown>) {
  runtimeLocalization = localization;
}

export function getRuntimeLocalization() {
  return runtimeLocalization;
}

export const themes: Record<string, typeof THEME_CONFIG> = {
  default: THEME_CONFIG,
};
