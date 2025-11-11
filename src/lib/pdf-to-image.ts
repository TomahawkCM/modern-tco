/**
 * PDF to Image Conversion Utility
 * Uses PDF.js loaded from CDN to bypass webpack bundling issues
 * Client-side only module
 */

export interface PdfPageImage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  imageData: ImageData;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

async function loadPdfJs(): Promise<any> {
  // Client-side only check
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser');
  }

  // Wait for PDF.js to load from CDN
  let attempts = 0;
  while (!window.pdfjsLib && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!window.pdfjsLib) {
    throw new Error('PDF.js library not loaded. Make sure the CDN script is included.');
  }

  // Configure worker from CDN (same version as main library)
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  return window.pdfjsLib;
}

/**
 * Convert PDF file to array of canvas images (one per page)
 * @param file - PDF file to process
 * @param maxPages - Maximum number of pages to process (default: 10)
 * @returns Array of canvas elements and ImageData for each page
 */
export async function convertPdfToImages(
  file: File,
  maxPages: number = 10
): Promise<PdfPageImage[]> {
  try {
    const pdfjsLib = await loadPdfJs();

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const numPages = Math.min(pdf.numPages, maxPages);
    const pages: PdfPageImage[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Calculate scale for good OCR quality (2x for better text recognition)
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      // Get ImageData for OCR processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      pages.push({
        pageNumber: pageNum,
        canvas,
        imageData,
      });
    }

    return pages;
  } catch (error) {
    console.error('[PDF Conversion] Error converting PDF to images:', error);
    throw new Error(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert a single PDF page to canvas
 * @param file - PDF file
 * @param pageNumber - Page number (1-indexed)
 * @returns Canvas element with rendered page
 */
export async function convertPdfPageToCanvas(
  file: File,
  pageNumber: number = 1
): Promise<HTMLCanvasElement> {
  const pdfjsLib = await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Invalid page number: ${pageNumber}. PDF has ${pdf.numPages} pages.`);
  }

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  return canvas;
}

/**
 * Get PDF metadata (page count, etc.)
 * @param file - PDF file
 * @returns PDF metadata
 */
export async function getPdfMetadata(file: File): Promise<{
  numPages: number;
  fileSize: number;
}> {
  const pdfjsLib = await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  return {
    numPages: pdf.numPages,
    fileSize: file.size,
  };
}

/**
 * Check if a file is a PDF
 * @param file - File to check
 * @returns True if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
