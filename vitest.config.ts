import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/vitest.setup.ts"],
    include: [
      // Run all Vitest tests in tests/ folder
      "tests/**/*.vitest.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules/**",
      ".next/**",
    ],
    coverage: {
      enabled: false,
      provider: "v8",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/lib": resolve(__dirname, "./src/lib"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/types": resolve(__dirname, "./src/types"),
      "@/data": resolve(__dirname, "./src/data"),
      "@/services": resolve(__dirname, "./src/services"),
    },
  },
});
