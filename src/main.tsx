import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "react-query";
import "@/config/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@/config/i18n";
import {
  loadCompleteTheme,
  applyThemeVariables,
  getActiveThemeName,
} from "@/config/asset-loader";
import { setRuntimeLocalization } from "@/config/localization";
import { UserTypeFetcher } from "./hooks/auth/userTypeFetcher";

const initializeApp = async () => {
  const themeName = getActiveThemeName();
  const theme = await loadCompleteTheme(themeName);

  applyThemeVariables(theme.variables);

  // Apply theme localization overrides
  const currentLang = localStorage.getItem("language") || "en";
  const themeLocalization = theme.localization?.[currentLang];
  if (themeLocalization) {
    setRuntimeLocalization(themeLocalization);
  }

  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  const faviconUrl =
    theme.assets?.faviconUrl || `${theme.metadata.favicon_url || "/icon.svg"}`;
  if (favicon) {
    favicon.href = faviconUrl;
  }

  // Manifest is now served statically via Vite plugin
  const manifestLink = document.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = "/manifest.json";
  document.head.appendChild(manifestLink);

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch {
      console.debug("Service worker registration not available");
    }
  }

  const queryClient = new QueryClient();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <UserTypeFetcher>
            <App />
            <Toaster position="top-center" richColors />
          </UserTypeFetcher>
        </QueryClientProvider>
      </I18nextProvider>
    </React.StrictMode>,
  );
};

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error);
});
