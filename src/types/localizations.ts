export interface LocalizationConfig {
  footer?: {
    text?: string;
    links?: Array<{ label: string; url: string }>;
    companyName?: string;
  };
  branding?: {
    companyName?: string;
    tagline?: string;
  };
  custom?: Record<string, string>;
}

export interface ThemeAssets {
  logoUrl?: string;
  faviconUrl?: string;
  appleIconUrl?: string;
  shortcutIconUrl?: string;
  customCss?: string;
}
