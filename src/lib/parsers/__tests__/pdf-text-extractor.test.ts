import { describe, it, expect } from "vitest";

describe("pdf-text-extractor", () => {
  it("exports extractPdfText function", async () => {
    const module = await import("../pdf-text-extractor");
    expect(typeof module.extractPdfText).toBe("function");
  });

  it("exports pdfHasText function", async () => {
    const module = await import("../pdf-text-extractor");
    expect(typeof module.pdfHasText).toBe("function");
  });

  it("extractPdfText rejects with invalid data", async () => {
    const { extractPdfText } = await import("../pdf-text-extractor");
    const buffer = new ArrayBuffer(10);
    // In jsdom, pdfjs-dist will fail since DOMMatrix isn't available
    await expect(extractPdfText(buffer)).rejects.toThrow();
  });

  it("pdfHasText returns false in non-browser environment", async () => {
    const { pdfHasText } = await import("../pdf-text-extractor");
    const buffer = new ArrayBuffer(10);
    const result = await pdfHasText(buffer);
    expect(result).toBe(false);
  });
});
