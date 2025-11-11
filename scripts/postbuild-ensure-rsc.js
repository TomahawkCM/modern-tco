#!/usr/bin/env node
// @ts-check
/**
 * Temporary shim for Vercel: Next 16 (React 19) only emits `page.js` artifacts
 * under `.next/server/app/**`, while Vercel's packager still looks for the older
 * `*.rsc` filenames. We duplicate each `page.js` (and trace) to a `.rsc` twin so
 * deployments succeed until Vercel updates its bundling logic.
 */

const fs = require("fs/promises");
const path = require("path");

/**
 * @param {string} targetPath
 * @returns {Promise<boolean>}
 */
async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} rootDir
 * @returns {Promise<string[]>}
 */
async function collectPageFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  /** @type {string[]} */
  const pages = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await collectPageFiles(entryPath)));
    } else if (entry.isFile() && entry.name === "page.js") {
      pages.push(entryPath);
    }
  }

  return pages;
}

/**
 * @param {string} appDir
 * @param {string} pagePath
 * @returns {{rscPath: string, nftSource: string, nftTarget: string} | null}
 */
function deriveTargets(appDir, pagePath) {
  const relative = path.relative(appDir, pagePath);
  if (!relative.endsWith("page.js")) {
    return null;
  }

  const base = relative === "page.js" ? "page" : relative.slice(0, -("page.js".length + 1));
  const rscPath = path.join(appDir, `${base}.rsc`);
  const nftSource = `${pagePath}.nft.json`;
  const nftTarget = path.join(appDir, `${base}.rsc.nft.json`);

  return { rscPath, nftSource, nftTarget };
}

/**
 * @returns {Promise<void>}
 */
async function ensureRscShims() {
  const appDir = path.join(process.cwd(), ".next", "server", "app");
  if (!(await pathExists(appDir))) {
    console.warn(`[postbuild] Skipping .rsc shim: ${appDir} missing`);
    return;
  }

  const pageFiles = await collectPageFiles(appDir);
  if (pageFiles.length === 0) {
    console.warn("[postbuild] No page.js artifacts found; skipping .rsc shim.");
    return;
  }

  let createdRsc = 0;
  let createdTrace = 0;

  for (const pagePath of pageFiles) {
    const targets = deriveTargets(appDir, pagePath);
    if (!targets) continue;

    // Duplicate page.js -> page.rsc
    if (!(await pathExists(targets.rscPath))) {
      const content = await fs.readFile(pagePath);
      await fs.writeFile(targets.rscPath, content);
      createdRsc += 1;
    }

    // Duplicate trace file if present
    if (await pathExists(targets.nftSource)) {
      if (!(await pathExists(targets.nftTarget))) {
        const traceContent = await fs.readFile(targets.nftSource);
        await fs.writeFile(targets.nftTarget, traceContent);
        createdTrace += 1;
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `[postbuild] Ensured ${createdRsc} .rsc shims and ${createdTrace} trace files for app routes.`
  );
}

ensureRscShims().catch((error) => {
  console.error("[postbuild] Failed to create .rsc shims:", error);
  process.exit(1);
});
