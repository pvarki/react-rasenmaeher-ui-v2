export interface ThemeAssets {
  logoUrl?: string;
  sidebarLogoUrl?: string;
  shortcutIconUrl?: string;
  appleIconUrl?: string;
  faviconUrl?: string;
  icon192Url?: string;
  icon512Url?: string;
}

export interface SidebarLogo {
  bgColor: string;
  icon?: string;
}

export interface ThemeMetadata {
  name: string;
  short_name: string;
  description: string;
  background_color: string;
  theme_color: string;
  icon_192: string;
  icon_512: string;
  screenshot_wide?: string;
  screenshot_narrow?: string;
  [key: string]: unknown;
}

export interface ThemeVariables {
  [key: string]: string;
}

export interface CompleteTheme {
  id: string;
  name: string;
  subName?: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  assets?: ThemeAssets;
  metadata: ThemeMetadata;
  variables: ThemeVariables;
  localization: Record<string, Record<string, unknown>>;
}
