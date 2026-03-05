import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRates, convertAmount } from "./fx-rates";

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("fx-rates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRates", () => {
    it("returns empty rates when no targets provided", async () => {
      const result = await getRates("USD", []);
      expect(result.base).toBe("USD");
      expect(result.rates).toEqual({});
    });

    it("returns empty rates when all targets match base", async () => {
      const result = await getRates("USD", ["USD"]);
      expect(result.base).toBe("USD");
      expect(result.rates).toEqual({});
    });

    it("fetches rates from frankfurter.app on cache miss", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          base: "USD",
          rates: { EUR: 0.92, GBP: 0.79 },
          date: "2026-03-04",
        }),
      });

      const result = await getRates("USD", ["EUR", "GBP"]);

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(result.base).toBe("USD");
      expect(result.rates.EUR).toBe(0.92);
      expect(result.rates.GBP).toBe(0.79);
    });

    it("throws on API failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(getRates("USD", ["EUR"])).rejects.toThrow("FX rate fetch failed");
    });

    it("uses cached rates when supabase client provided and cache is fresh", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: [
                    {
                      target_currency: "EUR",
                      rate: 0.91,
                      fetched_at: new Date().toISOString(),
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await getRates("USD", ["EUR"], mockSupabase);

      expect(result.rates.EUR).toBe(0.91);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("falls back to API when cache is incomplete", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Make the from().upsert() chain work for caching
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          base: "USD",
          rates: { EUR: 0.92 },
          date: "2026-03-04",
        }),
      });

      // Need to re-mock from for the cache write
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getRates("USD", ["EUR"], mockSupabase);
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(result.rates.EUR).toBe(0.92);
    });
  });

  describe("convertAmount", () => {
    it("converts amount using rate", () => {
      expect(convertAmount(100, 0.92)).toBeCloseTo(92);
    });

    it("handles zero amount", () => {
      expect(convertAmount(0, 0.92)).toBe(0);
    });

    it("handles rate of 1", () => {
      expect(convertAmount(100, 1)).toBe(100);
    });
  });
});
