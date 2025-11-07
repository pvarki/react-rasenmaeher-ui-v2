export interface ThemeConfig {
  name: string;
  subName?: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  sidebarLogo?: {
    bgColor: string;
    icon: string;
  };
  assets?: {
    logoUrl?: string;
    faviconUrl?: string;
  };
}

const defaultTheme: ThemeConfig = {
  name: "PV-Arki",
  subName: "Rasenmaeher",
  primaryColor: "oklch(0.205 0 0)",
  accentColor: "oklch(0.488 0.243 264.376)",
  backgroundColor: "oklch(0.145 0 0)",
  sidebarLogo: {
    bgColor: "#dc2626",
    icon: "lightning",
  },
  assets: {
    logoUrl: "/themes/default/logo.png",
    faviconUrl: "/themes/default/favicon.ico",
  },
};

const themes: Record<string, ThemeConfig> = {
  default: defaultTheme,
};

export function getTheme(themeName?: string): ThemeConfig {
  const selectedTheme = themeName || import.meta.env.VITE_THEME || "default";
  return themes[selectedTheme] || defaultTheme;
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(themes);
}
