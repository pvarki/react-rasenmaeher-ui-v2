export interface ThemeConfig {
  name: string;
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
  name: "default",
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

const tornileijonaTheme: ThemeConfig = {
  name: "tornileijona",
  primaryColor: "oklch(0.3 0.2 30)",
  accentColor: "oklch(0.6 0.2 140)",
  backgroundColor: "oklch(0.12 0 0)",
  sidebarLogo: {
    bgColor: "#2563eb",
    icon: "shield",
  },
  assets: {
    logoUrl: "/themes/tornileijona/logo.png",
    faviconUrl: "/themes/tornileijona/favicon.ico",
  },
};

const themes: Record<string, ThemeConfig> = {
  default: defaultTheme,
  tornileijona: tornileijonaTheme,
};

export function getTheme(themeName?: string): ThemeConfig {
  const selectedTheme = themeName || import.meta.env.VITE_THEME || "default";
  return themes[selectedTheme] || defaultTheme;
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(themes);
}
