#!/usr/bin/env node
/**
 * Temporary workaround for Vercel's build pipeline expecting legacy
 * `.rsc` artifacts for app router pages. Next 16 with React 19 only emits
 * `page.js` files, so we duplicate them to `.rsc` until Vercel updates.
 */
const fs = require("fs/promises");
const path = require("path");

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectPageEntries(startDir) {
  const entries = await fs.readdir(startDir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const entryPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await collectPageEntries(entryPath)));
    } else if (entry.isFile() && entry.name === "page.js") {
      pages.push(entryPath);
    }
  }

  return pages;
}

function deriveRscTargets(appDir, pagePath) {
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

async function ensureRscArtifacts() {
  const appDir = path.join(process.cwd(), ".next", "server", "app");
  if (!(await pathExists(appDir))) {
    console.warn(`[postbuild] Skipping .rsc shim: missing ${appDir}`);
    return;
  }

  const pageEntries = await collectPageEntries(appDir);
  if (pageEntries.length === 0) {
    console.warn(
      "[postbuild] No page.js entries found under .next/server/app; skipping .rsc shim."
    );
    return;
  }

  let createdRsc = 0;
  let createdTrace = 0;

  for (const pagePath of pageEntries) {
    const targets = deriveRscTargets(appDir, pagePath);
    if (!targets) continue;

    if (!(await pathExists(targets.rscPath))) {
      const content = await fs.readFile(pagePath);
      await fs.writeFile(targets.rscPath, content);
      createdRsc += 1;
    }

    if (await pathExists(targets.nftSource)) {
      if (!(await pathExists(targets.nftTarget))) {
        const traceContent = await fs.readFile(targets.nftSource);
        await fs.writeFile(targets.nftTarget, traceContent);
        createdTrace += 1;
      }
    }
  }

  // Vercel also expects index.rsc for the root page
  const rootPageRsc = path.join(appDir, "page.rsc");
  const rootIndexRsc = path.join(appDir, "index.rsc");
  if ((await pathExists(rootPageRsc)) && !(await pathExists(rootIndexRsc))) {
    const content = await fs.readFile(rootPageRsc);
    await fs.writeFile(rootIndexRsc, content);
    createdRsc += 1;
    console.log("[postbuild] Created index.rsc for root page (Vercel compatibility)");
  }

  const rootPageNft = path.join(appDir, "page.rsc.nft.json");
  const rootIndexNft = path.join(appDir, "index.rsc.nft.json");
  if ((await pathExists(rootPageNft)) && !(await pathExists(rootIndexNft))) {
    const content = await fs.readFile(rootPageNft);
    await fs.writeFile(rootIndexNft, content);
    createdTrace += 1;
    console.log("[postbuild] Created index.rsc.nft.json for root page (Vercel compatibility)");
  }

  console.log(
    `[postbuild] Ensured ${createdRsc} .rsc shims and ${createdTrace} trace files for Next app routes.`
  );
}

ensureRscArtifacts().catch((error) => {
  console.error("[postbuild] Failed to create .rsc shims:", error);
  process.exit(1);
});
