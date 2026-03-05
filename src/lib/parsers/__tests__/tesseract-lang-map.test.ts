import { describe, it, expect } from "vitest";
import { getOCRLanguage, getSupportedOCRLanguages } from "../tesseract-lang-map";

describe("tesseract-lang-map", () => {
  describe("getOCRLanguage", () => {
    it("maps English locale", () => {
      expect(getOCRLanguage("en-US")).toBe("eng");
    });

    it("maps German locale", () => {
      expect(getOCRLanguage("de-DE")).toBe("deu");
    });

    it("maps French locale", () => {
      expect(getOCRLanguage("fr-FR")).toBe("fra");
    });

    it("maps Spanish locale", () => {
      expect(getOCRLanguage("es-ES")).toBe("spa");
    });

    it("maps Japanese locale", () => {
      expect(getOCRLanguage("ja-JP")).toBe("jpn");
    });

    it("maps Chinese Simplified", () => {
      expect(getOCRLanguage("zh-CN")).toBe("chi_sim");
    });

    it("maps Chinese Traditional", () => {
      expect(getOCRLanguage("zh-TW")).toBe("chi_tra");
    });

    it("maps Arabic locale", () => {
      expect(getOCRLanguage("ar-SA")).toBe("ara");
    });

    it("maps base language when region not found", () => {
      expect(getOCRLanguage("de")).toBe("deu");
    });

    it("falls back to English for unknown locale", () => {
      expect(getOCRLanguage("xx-YY")).toBe("eng");
    });
  });

  describe("getSupportedOCRLanguages", () => {
    it("returns sorted array of languages", () => {
      const languages = getSupportedOCRLanguages();
      expect(languages.length).toBeGreaterThan(40);
      // Should be sorted alphabetically
      for (let i = 1; i < languages.length; i++) {
        expect(languages[i].name.localeCompare(languages[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it("includes English", () => {
      const languages = getSupportedOCRLanguages();
      expect(languages.some((l) => l.code === "eng")).toBe(true);
    });
  });
});
