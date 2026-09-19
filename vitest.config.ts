import path from "path";
import { defineConfig } from "vitest/config";

// Standalone on purpose: vite.config.ts loads Module Federation, which cannot
// run inside the test runner.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
