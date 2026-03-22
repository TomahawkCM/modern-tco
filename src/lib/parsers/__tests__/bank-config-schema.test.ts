import { describe, it, expect } from "vitest";
import {
  validateBankConfigZod,
  validateBankConfigFile,
  parseBankConfigJSON,
  generateBankConfigTemplate,
  exportBankConfig,
  BankConfigSchema,
} from "../bank-config-schema";

describe("BankConfigSchema", () => {
  const validConfig = {
    name: "Test Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
  };

  describe("validateBankConfigZod", () => {
    it("accepts a valid minimal config", () => {
      const result = validateBankConfigZod(validConfig);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validConfig);
    });

    it("accepts a full config with all optional fields", () => {
      const full = {
        ...validConfig,
        amountMultiplier: -1,
        hasHeader: true,
        skipRows: 3,
        encoding: "Shift-JIS",
        decimalSeparator: ",",
        thousandSeparator: ".",
        region: "EU",
        verified: true,
        verifiedDate: "2025-01-01",
        sampleRowCount: 5,
        communityContributed: true,
      };
      const result = validateBankConfigZod(full);
      expect(result.success).toBe(true);
    });

    it("rejects config with missing name", () => {
      const result = validateBankConfigZod({ ...validConfig, name: "" });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some((e) => e.includes("name"))).toBe(true);
    });

    it("rejects config with missing dateColumn", () => {
      const { dateColumn, ...rest } = validConfig;
      const result = validateBankConfigZod(rest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid encoding", () => {
      const result = validateBankConfigZod({
        ...validConfig,
        encoding: "ISO-8859-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid region", () => {
      const result = validateBankConfigZod({
        ...validConfig,
        region: "MARS",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative skipRows", () => {
      const result = validateBankConfigZod({ ...validConfig, skipRows: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects non-object input", () => {
      const result = validateBankConfigZod("not an object");
      expect(result.success).toBe(false);
    });
  });

  describe("validateBankConfigFile", () => {
    it("validates a complete config file", () => {
      const file = {
        $schema: "statementkit/bank-config",
        version: "1.0",
        banks: {
          testBank: validConfig,
          testBank2: { ...validConfig, name: "Test Bank 2" },
        },
      };
      const result = validateBankConfigFile(file);
      expect(Object.keys(result.valid)).toHaveLength(2);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("separates valid and invalid banks", () => {
      const file = {
        banks: {
          good: validConfig,
          bad: { name: "" },
        },
      };
      const result = validateBankConfigFile(file);
      expect(Object.keys(result.valid)).toHaveLength(1);
      expect(result.valid).toHaveProperty("good");
      expect(Object.keys(result.errors)).toHaveLength(1);
      expect(result.errors).toHaveProperty("bad");
    });

    it("rejects invalid file structure", () => {
      const result = validateBankConfigFile("not an object");
      expect(result.errors).toHaveProperty("_file");
    });
  });

  describe("parseBankConfigJSON", () => {
    it("parses config file format", () => {
      const json = JSON.stringify({
        banks: { testBank: validConfig },
      });
      const result = parseBankConfigJSON(json);
      expect(Object.keys(result.valid)).toHaveLength(1);
    });

    it("parses plain key-config map", () => {
      const json = JSON.stringify({ testBank: validConfig });
      const result = parseBankConfigJSON(json);
      expect(Object.keys(result.valid)).toHaveLength(1);
    });

    it("handles invalid JSON", () => {
      const result = parseBankConfigJSON("not json{");
      expect(result.errors).toHaveProperty("_parse");
    });

    it("handles non-object JSON", () => {
      const result = parseBankConfigJSON('"just a string"');
      expect(result.errors).toHaveProperty("_parse");
    });
  });

  describe("generateBankConfigTemplate", () => {
    it("generates valid JSON template", () => {
      const template = generateBankConfigTemplate("my_new_bank");
      const parsed = JSON.parse(template);
      expect(parsed.$schema).toBe("statementkit/bank-config");
      expect(parsed.banks).toHaveProperty("my_new_bank");
    });

    it("uses default key when none provided", () => {
      const template = generateBankConfigTemplate();
      const parsed = JSON.parse(template);
      expect(parsed.banks).toHaveProperty("my_bank");
    });

    it("template passes validation", () => {
      const template = generateBankConfigTemplate("test");
      const result = parseBankConfigJSON(template);
      expect(Object.keys(result.valid)).toHaveLength(1);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe("exportBankConfig", () => {
    it("exports a config as shareable JSON", () => {
      const exported = exportBankConfig("testBank", validConfig as any);
      const parsed = JSON.parse(exported);
      expect(parsed.$schema).toBe("statementkit/bank-config");
      expect(parsed.banks.testBank.name).toBe("Test Bank");
    });

    it("exported config passes validation", () => {
      const exported = exportBankConfig("testBank", validConfig as any);
      const result = parseBankConfigJSON(exported);
      expect(Object.keys(result.valid)).toHaveLength(1);
    });
  });
});
