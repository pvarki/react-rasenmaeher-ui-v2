import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { Toaster } from "sonner";
import "@/config/i18n";
import {
  loadCompleteTheme,
  applyThemeVariables,
  getActiveThemeName,
} from "@/config/asset-loader";
import { setRuntimeLocalization } from "@/config/localization";
import { QueryClient, QueryClientProvider } from "react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "@/config/i18n";
import { UserTypeFetcher } from "./hooks/auth/userTypeFetcher";
import { BrowserGuard } from "@/components/BrowserGuard";

async function enableMocking() {
  if (import.meta.env.VITE_MOCK !== "true") return;
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  console.log("[MOCK] MSW enabled — all API calls are mocked");
}

const initializeApp = async () => {
  await enableMocking();
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

  if ("serviceWorker" in navigator && import.meta.env.VITE_MOCK !== "true") {
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
          <BrowserGuard>
            <UserTypeFetcher>
              <App />
              <Toaster position="top-center" richColors />
            </UserTypeFetcher>
          </BrowserGuard>
        </QueryClientProvider>
      </I18nextProvider>
    </React.StrictMode>,
  );
};

// Ensure DOM is ready before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeApp().catch((error) => {
      console.error("Failed to initialize app:", error);
    });
  });
} else {
  initializeApp().catch((error) => {
    console.error("Failed to initialize app:", error);
  });
}
