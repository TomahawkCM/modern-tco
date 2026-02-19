/**
 * Match Highlighting Utility
 * Renders text with <mark> tags around matched substrings from Fuse.js results.
 *
 * CJK-aware: For CJK text, extends highlight boundaries to full character/word
 * boundaries to avoid splitting multi-byte characters mid-glyph.
 */

import { type ReactNode } from "react";
import { containsCJK, segmentWords } from "./text-utils";

/**
 * Highlight matched substrings in text using Fuse.js match indices
 * @param text - The full text to highlight
 * @param indices - Array of [start, end] inclusive index pairs from Fuse.js
 * @param locale - Optional locale for CJK word boundary detection
 * @returns React elements with <mark> wrapped around matched portions
 */
export function highlightMatches(
  text: string,
  indices: readonly [number, number][] | undefined,
  locale?: string
): ReactNode {
  if (!indices || indices.length === 0 || !text) {
    return text;
  }

  // Sort indices by start position and merge overlapping ranges
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  let merged: [number, number][] = [];

  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  // For CJK text, extend highlight boundaries to word boundaries
  if (locale && containsCJK(text)) {
    merged = snapToWordBoundaries(text, merged, locale);
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (let i = 0; i < merged.length; i++) {
    const [start, end] = merged[i];

    // Text before this match
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    // Highlighted match (end is inclusive in Fuse.js)
    parts.push(
      <mark key={i} className="rounded-sm bg-yellow-200/60 px-0.5 dark:bg-yellow-500/30">
        {text.slice(start, end + 1)}
      </mark>
    );

    lastIndex = end + 1;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/**
 * Snap highlight ranges to word boundaries for CJK text.
 * This prevents highlighting half a CJK word which would look odd.
 */
function snapToWordBoundaries(
  text: string,
  ranges: [number, number][],
  locale: string
): [number, number][] {
  // Build a map of word boundary positions
  const words = segmentWords(text, locale);
  const wordBounds: [number, number][] = [];
  let pos = 0;

  for (const word of words) {
    const idx = text.indexOf(word, pos);
    if (idx >= 0) {
      wordBounds.push([idx, idx + word.length - 1]);
      pos = idx + word.length;
    }
  }

  if (wordBounds.length === 0) return ranges;

  // For each highlight range, extend to cover any overlapping word boundaries
  return ranges.map(([start, end]) => {
    let snapStart = start;
    let snapEnd = end;

    for (const [wStart, wEnd] of wordBounds) {
      // If the highlight overlaps with this word, extend to cover the whole word
      if (wStart <= end && wEnd >= start) {
        snapStart = Math.min(snapStart, wStart);
        snapEnd = Math.max(snapEnd, wEnd);
      }
    }

    return [snapStart, snapEnd] as [number, number];
  });
}

/**
 * Find the best match indices for a specific field from Fuse.js results
 */
export function getMatchIndicesForField(
  matches: { key: string; value: string; indices: [number, number][] }[] | undefined,
  fieldName: string
): [number, number][] | undefined {
  if (!matches) return undefined;
  const match = matches.find((m) => m.key === fieldName);
  return match?.indices;
}
