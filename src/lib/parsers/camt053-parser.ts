/**
 * CAMT.053 (ISO 20022) Bank Statement Parser
 *
 * @deprecated Use camt-parser.ts for unified CAMT.052/053/054 support.
 * This file re-exports from the unified parser for backward compatibility.
 */

export { parseCAMT053File, isCAMTContent as isCAMT053Content } from "./camt-parser";
export type { CAMTParseOptions as CAMT053ParseOptions } from "./camt-parser";
