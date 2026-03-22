import { defineConfig } from "tsup";

export default defineConfig([
  // Main library entry
  {
    entry: {
      index: "src/index.ts",
      "exporters/index": "src/exporters/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    splitting: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    external: ["pdfjs-dist", "tesseract.js"],
    outDir: "dist",
  },
  // CLI entry (ESM only, with banner for shebang)
  {
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    dts: false,
    banner: { js: "#!/usr/bin/env node" },
    external: ["pdfjs-dist", "tesseract.js"],
    outDir: "dist",
  },
]);
