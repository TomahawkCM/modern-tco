/**
 * Shared types for the AI narrative layer.
 */

/** Result of a narrative generation call. */
export type NarrativeResult =
  | { readonly ok: true; readonly narrative: string }
  | { readonly ok: false; readonly error: string };
