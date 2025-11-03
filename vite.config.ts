import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
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
    react(),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
  ],
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
