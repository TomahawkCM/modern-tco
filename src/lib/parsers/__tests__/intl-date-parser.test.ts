import { describe, it, expect } from "vitest";
import { parseDate, disambiguateDateFormat } from "../intl-date-parser";

describe("intl-date-parser", () => {
  describe("parseDate", () => {
    it("parses US format (01/15/2025)", () => {
      const date = parseDate("01/15/2025");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getMonth()).toBe(0); // January
      expect(date!.getDate()).toBe(15);
    });

    it("parses ISO format (2025-01-15)", () => {
      const date = parseDate("2025-01-15");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });

    it("parses English month name (Jan 15, 2025)", () => {
      const date = parseDate("Jan 15, 2025");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });

    it("parses German date (15. Jan 2025)", () => {
      const date = parseDate("15. Jan 2025", "de-DE");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getDate()).toBe(15);
    });

    it("parses Spanish date (15 Ene 2025)", () => {
      const date = parseDate("15 Ene 2025", "es-ES");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(0);
    });

    it("parses French date (15 Fev 2025)", () => {
      const date = parseDate("15 Fev 2025", "fr-FR");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(1); // February
    });

    it("parses EU numeric format (15/01/2025) with locale hint", () => {
      const date = parseDate("15/01/2025", "de-DE");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(0);
    });

    it("parses dot-separated date (15.01.2025)", () => {
      const date = parseDate("15.01.2025", "de-DE");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(0);
    });

    it("returns null for garbage input", () => {
      expect(parseDate("not a date")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseDate("")).toBeNull();
    });
  });

  describe("disambiguateDateFormat", () => {
    it("detects DD/MM format when day > 12", () => {
      const result = disambiguateDateFormat(["15/01/2025", "28/02/2025"]);
      expect(result).toBe("DMY");
    });

    it("detects MM/DD format when month position > 12", () => {
      const result = disambiguateDateFormat(["01/15/2025", "02/28/2025"]);
      expect(result).toBe("MDY");
    });
  });
});
