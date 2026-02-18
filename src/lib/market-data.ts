/**
 * Market Data Integration (Phase 8)
 * Task 8.3.1: Fetch real-time stock prices
 *
 * Uses Yahoo Finance API (free, no API key required)
 * Alternative: Alpha Vantage (requires free API key)
 */

import { db, type PriceCache } from "./budget-db";

const CACHE_TTL = 3600000; // 1 hour in milliseconds

interface StockQuote {
  symbol: string;
  price: number;
  previousClose?: number;
  change?: number;
  changePercent?: number;
}

/**
 * Fetch stock price from Yahoo Finance API
 * Free tier, no API key required
 */
async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // Yahoo Finance query API (unofficial but widely used)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.warn(`Yahoo Finance API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]?.meta) {
      console.warn(`No data returned for ${symbol}`);
      return null;
    }

    const { meta } = data.chart.result[0];
    const { regularMarketPrice } = meta;
    const previousClose = meta.previousClose || meta.chartPreviousClose;

    if (!regularMarketPrice) {
      return null;
    }

    const change = previousClose ? regularMarketPrice - previousClose : 0;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      price: regularMarketPrice,
      previousClose,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get cached price if fresh enough
 */
async function getCachedPrice(symbol: string): Promise<PriceCache | null> {
  try {
    // Check if priceCache table exists first
    if (!db.priceCache) {
      return null;
    }

    const cached = await db.priceCache.where("symbol").equals(symbol.toUpperCase()).first();

    if (!cached) {
      return null;
    }

    const age = Date.now() - new Date(cached.fetchedAt).getTime();

    if (age < CACHE_TTL) {
      return cached;
    }

    return null;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

/**
 * Cache stock price
 */
async function cachePrice(quote: StockQuote, source: "yahoo" | "fallback"): Promise<void> {
  try {
    if (!db.priceCache) {
      console.warn("Price cache table not available");
      return;
    }

    const cacheEntry: PriceCache = {
      id: `price_${quote.symbol.toUpperCase()}`,
      symbol: quote.symbol.toUpperCase(),
      price: quote.price,
      previousClose: quote.previousClose,
      change: quote.change,
      changePercent: quote.changePercent,
      fetchedAt: new Date(),
      source,
    };

    await db.priceCache.put(cacheEntry);
  } catch (error) {
    console.error("Error caching price:", error);
  }
}

/**
 * Get current stock price with caching
 * Returns cached price if fresh, otherwise fetches from API
 */
export async function getStockPrice(symbol: string): Promise<number | null> {
  const normalizedSymbol = symbol.toUpperCase();

  // Try cache first
  const cached = await getCachedPrice(normalizedSymbol);
  if (cached) {
    console.log(`Using cached price for ${normalizedSymbol}: $${cached.price}`);
    return cached.price;
  }

  // Fetch from Yahoo Finance
  console.log(`Fetching fresh price for ${normalizedSymbol}...`);
  const quote = await fetchYahooQuote(normalizedSymbol);

  if (quote) {
    await cachePrice(quote, "yahoo");
    return quote.price;
  }

  // Fallback: check if we have any cached price (even if expired)
  try {
    if (db.priceCache) {
      const staleCache = await db.priceCache.where("symbol").equals(normalizedSymbol).first();

      if (staleCache) {
        console.warn(`Using stale cache for ${normalizedSymbol} (API fetch failed)`);
        return staleCache.price;
      }
    }
  } catch (error) {
    console.error("Error reading stale cache:", error);
  }

  return null;
}

/**
 * Get detailed quote with additional information
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  const normalizedSymbol = symbol.toUpperCase();

  // Try cache first
  const cached = await getCachedPrice(normalizedSymbol);
  if (cached) {
    return {
      symbol: cached.symbol,
      price: cached.price,
      previousClose: cached.previousClose,
      change: cached.change,
      changePercent: cached.changePercent,
    };
  }

  // Fetch from API
  const quote = await fetchYahooQuote(normalizedSymbol);

  if (quote) {
    await cachePrice(quote, "yahoo");
    return quote;
  }

  return null;
}

/**
 * Batch fetch prices for multiple symbols
 * Optimized to use cache when possible
 */
export async function getBatchStockPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  // Process symbols concurrently (but with a limit to avoid rate limiting)
  const batchSize = 5;
  const normalizedSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));

  for (let i = 0; i < normalizedSymbols.length; i += batchSize) {
    const batch = normalizedSymbols.slice(i, i + batchSize);

    const results = await Promise.all(
      batch.map(async (symbol) => {
        const price = await getStockPrice(symbol);
        return { symbol, price };
      })
    );

    results.forEach(({ symbol, price }) => {
      if (price !== null) {
        prices[symbol] = price;
      }
    });

    // Small delay between batches to respect rate limits
    if (i + batchSize < normalizedSymbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return prices;
}

/**
 * Clear price cache (useful for testing or forcing refresh)
 */
export async function clearPriceCache(): Promise<void> {
  try {
    if (db.priceCache) {
      await db.priceCache.clear();
      console.log("Price cache cleared");
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  freshEntries: number;
  staleEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  try {
    if (!db.priceCache) {
      return {
        totalEntries: 0,
        freshEntries: 0,
        staleEntries: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const allEntries = await db.priceCache.toArray();
    const now = Date.now();

    const freshEntries = allEntries.filter(
      (entry) => now - new Date(entry.fetchedAt).getTime() < CACHE_TTL
    );

    const dates = allEntries.map((e) => new Date(e.fetchedAt).getTime());

    return {
      totalEntries: allEntries.length,
      freshEntries: freshEntries.length,
      staleEntries: allEntries.length - freshEntries.length,
      oldestEntry: dates.length > 0 ? new Date(Math.min(...dates)) : null,
      newestEntry: dates.length > 0 ? new Date(Math.max(...dates)) : null,
    };
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return {
      totalEntries: 0,
      freshEntries: 0,
      staleEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
}
