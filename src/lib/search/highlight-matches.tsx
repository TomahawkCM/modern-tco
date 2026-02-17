/**
 * Match Highlighting Utility
 * Renders text with <mark> tags around matched substrings from Fuse.js results
 */

import { type ReactNode } from "react";

/**
 * Highlight matched substrings in text using Fuse.js match indices
 * @param text - The full text to highlight
 * @param indices - Array of [start, end] inclusive index pairs from Fuse.js
 * @returns React elements with <mark> wrapped around matched portions
 */
export function highlightMatches(
  text: string,
  indices: readonly [number, number][] | undefined
): ReactNode {
  if (!indices || indices.length === 0 || !text) {
    return text;
  }

  // Sort indices by start position and merge overlapping ranges
  const sorted = [...indices].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];

  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
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
