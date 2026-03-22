/**
 * Shared PDF.js Loader
 *
 * Single entry point for loading pdfjs-dist with environment-aware worker setup.
 * Used by both pdf-ocr-parser.ts and pdf-text-extractor.ts.
 *
 * SDK consumers can call setPdfWorkerSrc() before any PDF operations to
 * configure a custom worker path (e.g., for offline/air-gapped environments).
 */

let customWorkerSrc: string | undefined;

/**
 * Configure a custom PDF.js worker source path.
 * Call before any PDF operations to override the default CDN-based worker.
 *
 * @example
 * // Use a local bundled worker (Vite)
 * import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
 * setPdfWorkerSrc(pdfjsWorker);
 *
 * @example
 * // Disable worker entirely (slower, but works everywhere)
 * setPdfWorkerSrc("");
 *
 * @example
 * // Use a self-hosted worker
 * setPdfWorkerSrc("/assets/pdf.worker.min.mjs");
 */
export function setPdfWorkerSrc(src: string): void {
  customWorkerSrc = src;
}

/**
 * Dynamically import PDF.js with environment-aware worker setup.
 *
 * Worker resolution order:
 * 1. Consumer-configured path (via setPdfWorkerSrc)
 * 2. CDN worker matching installed pdfjs-dist version (browser only)
 * 3. No worker - runs synchronously in main thread (Node.js)
 */
export async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  // Only set worker if not already configured (by consumer or previous call)
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    if (customWorkerSrc !== undefined) {
      pdfjs.GlobalWorkerOptions.workerSrc = customWorkerSrc;
    } else if (typeof window !== "undefined") {
      // Browser: CDN worker matching installed version
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    } else {
      // Node.js: disable worker (runs synchronously in main thread)
      pdfjs.GlobalWorkerOptions.workerSrc = "";
    }
  }

  return pdfjs;
}
