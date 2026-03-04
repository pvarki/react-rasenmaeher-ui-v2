import path from "path";
import fs from "fs";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { federation } from "@module-federation/vite";

function themePlugin(env: Record<string, string>): Plugin {
  const themeName = env.VITE_THEME || "default";

  const VIRTUAL_ID = "virtual-theme-config";
  const RESOLVED_ID = "\0virtual-theme-config";

  return {
    name: "vite-plugin-theme",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;

      const themesDir = path.resolve(__dirname, "./public/themes");
      const themeJsonPath = path.join(themesDir, themeName, "theme.json");
      const defaultThemeJsonPath = path.join(
        themesDir,
        "default",
        "theme.json",
      );

      const variables = fs.existsSync(themeJsonPath)
        ? JSON.parse(fs.readFileSync(themeJsonPath, "utf8"))
        : fs.existsSync(defaultThemeJsonPath)
          ? JSON.parse(fs.readFileSync(defaultThemeJsonPath, "utf8"))
          : {};

      const manifestPath = path.join(themesDir, themeName, "manifest.json");
      const defaultManifestPath = path.join(
        themesDir,
        "default",
        "manifest.json",
      );

      const metadata = fs.existsSync(manifestPath)
        ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
        : fs.existsSync(defaultManifestPath)
          ? JSON.parse(fs.readFileSync(defaultManifestPath, "utf8"))
          : {};

      const localizationDir = path.join(themesDir, themeName, "localization");
      const defaultLocalizationDir = path.join(
        themesDir,
        "default",
        "localization",
      );

      const localization: Record<string, unknown> = {};
      for (const lang of ["en", "fi", "sv"]) {
        const langFile = path.join(localizationDir, `${lang}.json`);
        const defaultLangFile = path.join(
          defaultLocalizationDir,
          `${lang}.json`,
        );

        if (fs.existsSync(langFile)) {
          localization[lang] = JSON.parse(fs.readFileSync(langFile, "utf8"));
        } else if (fs.existsSync(defaultLangFile)) {
          localization[lang] = JSON.parse(
            fs.readFileSync(defaultLangFile, "utf8"),
          );
        }
      }

      const themeConfig = {
        id: themeName,
        name: metadata.name ?? themeName,
        short_name: metadata.short_name,
        description: metadata.description,
        variables,
        metadata,
        localization,
        baseUrl: `/themes/${themeName}`,
      };

      return `export default ${JSON.stringify(themeConfig, null, 2)}`;
    },
  };
}

function manifestPlugin(env: Record<string, string>): Plugin {
  const themeName = env.VITE_THEME || "default";

  const generateManifest = () => {
    const themesDir = path.resolve(__dirname, "./public/themes");
    const manifestPath = path.join(themesDir, themeName, "manifest.json");
    const defaultManifestPath = path.join(
      themesDir,
      "default",
      "manifest.json",
    );

    const themeManifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
      : fs.existsSync(defaultManifestPath)
        ? JSON.parse(fs.readFileSync(defaultManifestPath, "utf8"))
        : {};

    const baseUrl = `/themes/${themeName}`;

    return {
      id: "/",
      name: themeManifest.name || themeName,
      short_name: env.SERVER_DOMAIN || themeManifest.short_name,
      description: themeManifest.description || "",
      start_url: "/",
      scope: "/",
      display: "standalone",
      ...(themeManifest.background_color && {
        background_color: themeManifest.background_color,
      }),

      ...(themeManifest.theme_color && {
        theme_color: themeManifest.theme_color,
      }),
      orientation: "portrait-primary",
      display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
      icons: [
        {
          src: themeManifest.icon_192 || `${baseUrl}/icons/icon-192x192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: themeManifest.icon_512 || `${baseUrl}/icons/icon-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
      screenshots: [
        {
          src:
            themeManifest.screenshot_wide ||
            "/themes/default/assets/Onboarding/ON_BOARDING_WELCOME.png",
          sizes: "1918x1111",
          type: "image/png",
          form_factor: "wide",
          label: "Desktop view",
        },
        {
          src:
            themeManifest.screenshot_narrow ||
            "/themes/default/assets/Onboarding/ON_BOARDING_WELCOME.png",
          sizes: "1918x1111",
          type: "image/png",
          form_factor: "narrow",
          label: "Mobile view",
        },
      ],
      protocol_handlers: [
        {
          protocol: "web+pvarki",
          url: "/invite-code/%s",
        },
      ],
      ASSETS_DIR: themeManifest.ASSETS_DIR || `${baseUrl}/assets/`,
    };
  };

  return {
    name: "vite-plugin-manifest",
    enforce: "pre",

    closeBundle() {
      const pwaManifest = generateManifest();

      const distDir = path.resolve(__dirname, "./dist");
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(distDir, "manifest.json"),
        JSON.stringify(pwaManifest, null, 2),
      );

      console.log(`Generated manifest.json for theme: ${themeName}`);
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.url === "/manifest.json" ||
          req.url?.startsWith("/manifest.json?")
        ) {
          const pwaManifest = generateManifest();
          res.setHeader("Content-Type", "application/manifest+json");
          res.end(JSON.stringify(pwaManifest, null, 2));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      manifestPlugin(env),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      federation({
        name: "rasenmaeher",
        shared: {
          react: { requiredVersion: "18.3.1", singleton: true },
          i18next: { requiredVersion: "25.6.2", singleton: true },
          "react-i18next": { requiredVersion: "16.3.3", singleton: true },
          "@tanstack/react-router": {
            requiredVersion: "1.135.2",
            singleton: true,
          },
        },
        runtime: "@module-federation/enhanced/runtime",
      }),
      react(),
      tailwindcss(),
      themePlugin(env),
    ],
    build: {
      target: "chrome89",
      chunkSizeWarningLimit: 600,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // pdfmake & html2canvas are dynamically imported — keep them
            // as separate lazy chunks, NOT merged into one giant chunk
            if (id.includes("pdfmake/build/vfs_fonts")) {
              return "pdf-fonts";
            }
            if (id.includes("pdfmake")) {
              return "pdf-core";
            }
            if (id.includes("html2canvas")) {
              return "html2canvas";
            }
            // Markdown rendering (lazy-loaded)
            if (
              id.includes("node_modules/react-markdown") ||
              id.includes("node_modules/remark-") ||
              id.includes("node_modules/rehype-") ||
              id.includes("node_modules/unified") ||
              id.includes("node_modules/unist-") ||
              id.includes("node_modules/mdast-") ||
              id.includes("node_modules/hast-") ||
              id.includes("node_modules/micromark") ||
              id.includes("node_modules/devlop") ||
              id.includes("node_modules/vfile")
            ) {
              return "vendor-markdown";
            }
            // Core React runtime
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")
            ) {
              return "vendor-react";
            }
            // React Query
            if (id.includes("node_modules/react-query")) {
              return "vendor-react-query";
            }
            // Routing
            if (id.includes("@tanstack/react-router")) {
              return "vendor-router";
            }
            // i18n — split runtime from locale data
            if (
              id.includes("node_modules/i18next") ||
              id.includes("node_modules/react-i18next")
            ) {
              return "vendor-i18n";
            }
            // Icons — tree-shake via individual imports
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons";
            }
            // Radix UI primitives
            if (id.includes("node_modules/@radix-ui")) {
              return "vendor-radix";
            }
            // Form libraries
            if (
              id.includes("node_modules/formik") ||
              id.includes("node_modules/yup")
            ) {
              return "vendor-forms";
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      watch: { ignored: ["**/.env*"] },
      host: env.SERVER_DOMAIN || "localhost",
      fs: {
        allow: [".", "../shared"],
      },
      allowedHosts: [
        `mtls.${env.SERVER_DOMAIN ?? "localhost"}`,
        env.SERVER_DOMAIN ?? "localhost",
        "localhost",
        "0.0.0.0",
        "mtls.localmaeher.dev.pvarki.fi",
        "localmaeher.dev.pvarki.fi",
        /^mtls\..+\.dev\.pvarki\.fi$/,
        /^.+\.dev\.pvarki\.fi$/,
        /^mtls\..+\.solution\.dev\.pvarki\.fi$/,
        /^.+\.solution\.dev\.pvarki\.fi$/,
      ].filter(Boolean),
      proxy: {
        "/api": {
          target: "http://rmapi:8000",
          secure: false,
        },
      },
    },
  };
});
