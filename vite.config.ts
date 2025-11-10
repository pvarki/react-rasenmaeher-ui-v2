import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { federation } from "@module-federation/vite";
import fs from "fs";

function loadThemeAssets() {
  const themesDir = path.resolve(__dirname, "./public/themes");
  if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir, { recursive: true });
  }
  return themesDir;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    federation({
      name: "rasenmaeher",
      shared: {
        react: { singleton: true, requiredVersion: "18.3.1" },
      },
      runtime: "@module-federation/enhanced/runtime",
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    target: "chrome89",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    watch: {
      ignored: ["**/.env*"],
    },
    host: process.env.SERVER_DOMAIN || "localhost",
    fs: { allow: [".", "../shared"] },
    allowedHosts: [
      "mtls." + (process.env.SERVER_DOMAIN ?? "localhost"),
      process.env.SERVER_DOMAIN ?? "localhost", // Dynamically allow the current domain
      "localhost", // Always allow localhost for local dev
      "0.0.0.0", // Allow any network access (useful in Docker)
      "mtls.localmaeher.dev.pvarki.fi",
      "localmaeher.dev.pvarki.fi",
    ].filter(Boolean), // Remove undefined values
    proxy: {
      "/api": {
        target: "http://rmapi:8000",
        secure: false,
      },
    },
  },
  define: {
    __THEME_ASSETS_DIR__: JSON.stringify(loadThemeAssets()),
  },
});
