/**
 * Money Module — ISO 4217 currency handling
 *
 * Responsibilities:
 * - ISO 4217 currency codes
 * - Minor unit integer storage
 * - Deterministic rounding rules
 */

export type { MinorAmount } from "./types";
export {
  minorAmount,
  addMinor,
  subtractMinor,
  sumMinor,
  toMajorUnits,
  formatMoney,
} from "./operations";
