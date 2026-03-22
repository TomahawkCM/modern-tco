/**
 * PDF Native Text Extraction
 * Extracts selectable text from PDF files using pdfjs-dist.
 * ~90% of bank-generated PDFs have a text layer, so this avoids OCR entirely.
 */

export interface PageText {
  pageNumber: number;
  text: string;
  items: TextItem[];
}

export interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

export interface PdfTextResult {
  text: string;
  hasText: boolean;
  pages: PageText[];
  totalPages: number;
}

/**
 * Dynamically import PDF.js with environment-aware worker setup.
 * Works in both browser and Node.js environments.
 */
async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  // Only set worker if not already configured
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    } else {
      // Node.js: disable worker (runs synchronously in main thread)
      pdfjs.GlobalWorkerOptions.workerSrc = "";
    }
  }

  return pdfjs;
}

/**
 * Extract all text from a PDF file using the native text layer.
 * This is free, fast, and works for all languages since the text is already encoded.
 *
 * @param pdfData - PDF file as ArrayBuffer, Uint8Array, or File
 * @returns Text content with per-page breakdown and position data
 */
export async function extractPdfText(
  pdfData: ArrayBuffer | Uint8Array | File
): Promise<PdfTextResult> {
  let data: ArrayBuffer | Uint8Array;

  if (pdfData instanceof File) {
    data = await pdfData.arrayBuffer();
  } else {
    data = pdfData;
  }

  const pdfjs = await loadPdfJs();
  const pdfDocument = await pdfjs.getDocument(data).promise;
  const totalPages = pdfDocument.numPages;
  const pages: PageText[] = [];
  const allText: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    const items: TextItem[] = textContent.items
      .filter((item: any) => item.str !== undefined)
      .map((item: any) => ({
        str: item.str || "",
        x: item.transform?.[4] ?? 0,
        y: item.transform?.[5] ?? 0,
        width: item.width ?? 0,
        height: item.height ?? 0,
        fontName: item.fontName,
      }));

    // Reconstruct text with line breaks based on Y-position changes
    const pageText = reconstructTextWithLineBreaks(items);

    pages.push({
      pageNumber: pageNum,
      text: pageText,
      items,
    });

    allText.push(pageText);
  }

  const fullText = allText.join("\n\n");

  // hasText = true if we extracted more than 100 chars of meaningful text
  const meaningfulText = fullText.replace(/\s+/g, "").length;
  const hasText = meaningfulText > 100;

  return {
    text: fullText,
    hasText,
    pages,
    totalPages,
  };
}

/**
 * Reconstruct text from positioned items, inserting line breaks
 * where the Y coordinate changes significantly (new row).
 */
function reconstructTextWithLineBreaks(items: TextItem[]): string {
  if (items.length === 0) return "";

  // Sort items by Y (descending, since PDF Y=0 is bottom) then by X
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3) return yDiff; // Different lines
    return a.x - b.x; // Same line, sort by X
  });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let lastY = sorted[0]?.y ?? 0;
  let lastX = 0;

  for (const item of sorted) {
    if (!item.str) continue;

    // Detect line break: Y position changed by more than ~half a line height
    const lineHeight = Math.max(item.height, 8);
    const yDelta = Math.abs(item.y - lastY);

    if (yDelta > lineHeight * 0.5 && currentLine.length > 0) {
      lines.push(currentLine.join(""));
      currentLine = [];
      lastX = 0;
    }

    // Add spacing between items on the same line
    if (currentLine.length > 0 && item.x - lastX > 5) {
      // Large gap suggests a column separator
      const gap = item.x - lastX;
      if (gap > 30) {
        currentLine.push("\t");
      } else if (gap > 3) {
        currentLine.push(" ");
      }
    }

    currentLine.push(item.str);
    lastY = item.y;
    lastX = item.x + (item.width || 0);
  }

  // Don't forget last line
  if (currentLine.length > 0) {
    lines.push(currentLine.join(""));
  }

  return lines.join("\n");
}

/**
 * Quick check if PDF has extractable text (without full extraction).
 * Checks only the first page for speed.
 */
export async function pdfHasText(pdfData: ArrayBuffer | Uint8Array | File): Promise<boolean> {
  let data: ArrayBuffer | Uint8Array;

  if (pdfData instanceof File) {
    data = await pdfData.arrayBuffer();
  } else {
    data = pdfData;
  }

  try {
    const pdfjs = await loadPdfJs();
    const pdfDocument = await pdfjs.getDocument(data).promise;
    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();

    const textLength = textContent.items
      .map((item: any) => item.str || "")
      .join("")
      .trim().length;

    return textLength > 100;
  } catch {
    return false;
  }
}
