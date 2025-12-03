/**
 * Asset Loader - Dynamically loads themes, localization, and assets
 * No code modifications needed - just add new theme folders to /public/themes/
 * System automatically detects theme folders and uses them instead of default
 */

import type {
  CompleteTheme,
  ThemeMetadata,
  ThemeVariables,
  ThemeAssets,
} from "@/types/theme";
import { themes } from "@/config/themes";

/**
 * Detect active theme - looks for non-default theme folder, falls back to default
 * This allows one custom theme to work automatically without configuration
 */
export function detectActiveTheme(): string {
  const envTheme =
    (import.meta.env.VITE_THEME as string) || localStorage.getItem("theme");
  if (envTheme && themes[envTheme]) return envTheme;

  const customTheme = Object.keys(themes).find((t) => t !== "default");
  if (customTheme) return customTheme;
  return "default";
}

/**
 * Get available themes from manifest
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}

/**
 * Load theme variables from theme.json
 */
function loadThemeVariables(themeName: string): ThemeVariables {
  return themes[themeName]?.variables || themes["default"].variables;
}

/**
 * Load localization from theme folder
 */
function loadThemeLocalization(
  themeName: string,
  language: string,
): Record<string, unknown> {
  return (
    themes[themeName]?.localization[language] ||
    themes["default"].localization[language] ||
    {}
  );
}

/**
 * Load metadata and assets from manifest.json
 */
function loadThemeManifest(themeName: string): ThemeMetadata {
  return themes[themeName]?.metadata || themes["default"].metadata;
}

/**
 * Extract theme colors from CSS variables
 */
function extractThemeColors(variables: ThemeVariables): {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
} {
  return {
    primaryColor: variables["primary"] || "#cc66bb",
    accentColor: variables["accent"] || "#882255",
    backgroundColor: variables["background"] || "#1a1a1a",
  };
}

/**
 * Build assets object from manifest
 */
function buildAssets(metadata: ThemeMetadata, themeName: string): ThemeAssets {
  const baseUrl = `/themes/${themeName}`;
  return {
    logoUrl: (metadata.logo_url as string) || `${baseUrl}/assets/logo.png`,
    shortcutIconUrl:
      (metadata.icon_192 as string) || `${baseUrl}/icons/icon-192x192.png`,
    appleIconUrl:
      (metadata.icon_512 as string) || `${baseUrl}/icons/icon-512x512.png`,
    faviconUrl:
      (metadata.favicon_url as string) || `${baseUrl}/assets/favicon.ico`,
    icon192Url:
      (metadata.icon_192 as string) || `${baseUrl}/icons/icon-192x192.png`,
    icon512Url:
      (metadata.icon_512 as string) || `${baseUrl}/icons/icon-512x512.png`,
  };
}

/**
 * Load complete theme with all data
 */
export function loadCompleteTheme(themeName: string): CompleteTheme {
  const variables = loadThemeVariables(themeName);
  const metadata = loadThemeManifest(themeName);

  const localization: Record<string, Record<string, unknown>> = {};
  const languages = ["en", "fi", "sv"];

  for (const lang of languages) {
    localization[lang] = loadThemeLocalization(themeName, lang);
  }

  const { primaryColor, accentColor, backgroundColor } =
    extractThemeColors(variables);
  const assets = buildAssets(metadata, themeName);

  const completeTheme: CompleteTheme = {
    id: themeName,
    name:
      (metadata.name as string) ||
      themeName.charAt(0).toUpperCase() + themeName.slice(1),
    subName:
      (metadata.short_name as string) || (metadata.description as string),
    primaryColor,
    accentColor,
    backgroundColor,
    assets,
    metadata,
    variables,
    localization,
  };

  return completeTheme;
}

/**
 * Apply theme CSS variables to DOM
 */
export function applyThemeVariables(variables: ThemeVariables) {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

/**
 * Get active theme name from environment or localStorage
 */
export function getActiveThemeName(): string {
  return (
    (import.meta.env.VITE_THEME as string) ||
    localStorage.getItem("theme") ||
    "default"
  );
}

/**
 * Set active theme name to localStorage
 */
export function setActiveThemeName(themeName: string) {
  localStorage.setItem("theme", themeName);
  window.location.reload();
}

/**
 * Clear theme cache
 */
export function clearThemeCache() {
  // No cache to clear since all theme loading is done at build time
}
