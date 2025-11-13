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
    customCss?: string;
  };
}

const defaultTheme: ThemeConfig = {
  name: "PV-Arki",
  subName: "Deploy App",
  primaryColor: "#343434",
  accentColor: "#4338ca",
  backgroundColor: "#252525",
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

const customThemeJson = import.meta.env.VITE_THEME_CONFIG;
if (customThemeJson) {
  try {
    const customTheme = JSON.parse(customThemeJson);
    themes.custom = { ...defaultTheme, ...customTheme };
  } catch (error) {
    console.warn("Failed to parse custom theme config:", error);
  }
}

export function getTheme(themeName?: string): ThemeConfig {
  const selectedTheme = themeName || import.meta.env.VITE_THEME || "default";
  return themes[selectedTheme] || defaultTheme;
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(themes);
}

export function loadThemeAssets(theme: ThemeConfig) {
  if (theme.assets?.customCss) {
    const style = document.createElement("style");
    style.textContent = theme.assets.customCss;
    document.head.appendChild(style);
  }
}
