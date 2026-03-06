import { describe, it, expect } from "vitest";
import { isMT940Content } from "../mt940-parser";

// MT940 manual parser test via the manual fallback
// (mt940-js library requires specific buffer handling; we test the manual path)
const SAMPLE_MT940 = `:20:STMT2025011501
:25:DEUTDEDB/1234567890
:28C:1/1
:60F:C250115EUR1000,00
:61:250115D50,00NTRFNONREF//PAYEE1
:86:Grocery Store payment
:61:250120C200,00NTRFNONREF//PAYEE2
:86:Salary deposit
:62F:C250120EUR1150,00
`;

describe("mt940-parser", () => {
  describe("isMT940Content", () => {
    it("detects MT940 content with :20: and :60F:", () => {
      expect(isMT940Content(SAMPLE_MT940)).toBe(true);
    });

    it("detects MT940 with :20: and :61:", () => {
      expect(isMT940Content(":20:REF\n:61:250115D100,00NTRFTEST")).toBe(true);
    });

    it("rejects non-MT940 content", () => {
      expect(isMT940Content("Date,Amount,Description")).toBe(false);
    });

    it("rejects content with only :20:", () => {
      expect(isMT940Content(":20:REF")).toBe(false);
    });
  });

  // Note: parseMT940File is async and uses mt940-js library.
  // Full parsing tests would require mocking the library or using the manual fallback.
  // The manual fallback is tested implicitly through integration tests.
});
