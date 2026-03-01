/**
 * Represents a monetary amount in minor units (e.g., cents).
 *
 * - amountMinor: Integer value in smallest currency unit (100 = $1.00)
 * - currency: ISO 4217 code (e.g., "USD", "EUR", "GBP")
 */
export interface MinorAmount {
  readonly amountMinor: number;
  readonly currency: string;
}
