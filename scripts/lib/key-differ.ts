/**
 * Key Differ - Detects changed translation keys via git diff
 *
 * Compares current en-US.json with previous version to identify:
 * - Added keys (new translations needed)
 * - Modified keys (re-translation needed)
 * - Removed keys (cleanup needed)
 */

import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const execFileAsync = promisify(execFile);

export interface KeyChanges {
  added: string[];
  modified: string[];
  removed: string[];
  unchanged: string[];
}

/**
 * Get hash of a value for change detection
 */
function hashValue(value: any): string {
  return crypto.createHash("md5").update(JSON.stringify(value)).digest("hex");
}

/**
 * Flatten nested object into dot-notation keys
 * Example: { nav: { dashboard: "Dashboard" } } => { "nav.dashboard": "Dashboard" }
 */
function flattenKeys(obj: any, prefix: string = ""): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Recurse for nested objects
      Object.assign(result, flattenKeys(value, fullKey));
    } else {
      // Leaf node - store value
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Get previous version of a file from git (safe - uses execFile)
 */
async function getPreviousFileContent(
  filePath: string,
  commit: string = "HEAD"
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", ["show", `${commit}:${filePath}`]);
    return stdout;
  } catch (error) {
    // File doesn't exist in previous commit (new file)
    return null;
  }
}

/**
 * Detect changed keys between current and previous file versions
 */
export async function detectChangedKeys(
  currentFilePath: string,
  previousCommit: string = "HEAD"
): Promise<KeyChanges> {
  // Read current file
  const currentContent = fs.readFileSync(currentFilePath, "utf-8");
  const currentObj = JSON.parse(currentContent);
  const currentKeys = flattenKeys(currentObj);

  // Get previous file from git
  const previousContent = await getPreviousFileContent(currentFilePath, previousCommit);

  if (!previousContent) {
    // New file - all keys are "added"
    return {
      added: Object.keys(currentKeys),
      modified: [],
      removed: [],
      unchanged: [],
    };
  }

  const previousObj = JSON.parse(previousContent);
  const previousKeys = flattenKeys(previousObj);

  // Categorize keys
  const added: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];
  const removed: string[] = [];

  // Check current keys
  for (const [key, value] of Object.entries(currentKeys)) {
    if (!(key in previousKeys)) {
      added.push(key);
    } else if (hashValue(value) !== hashValue(previousKeys[key])) {
      modified.push(key);
    } else {
      unchanged.push(key);
    }
  }

  // Check for removed keys
  for (const key of Object.keys(previousKeys)) {
    if (!(key in currentKeys)) {
      removed.push(key);
    }
  }

  return { added, modified, removed, unchanged };
}

/**
 * Detect changed keys from git staging area (for pre-commit hook)
 */
export async function detectStagedChanges(filePath: string): Promise<KeyChanges> {
  try {
    // Get staged version (safe - uses execFile)
    const { stdout: stagedContent } = await execFileAsync("git", ["show", `:${filePath}`]);
    const stagedObj = JSON.parse(stagedContent);
    const stagedKeys = flattenKeys(stagedObj);

    // Get HEAD version
    const headContent = await getPreviousFileContent(filePath, "HEAD");

    if (!headContent) {
      // New file in staging
      return {
        added: Object.keys(stagedKeys),
        modified: [],
        removed: [],
        unchanged: [],
      };
    }

    const headObj = JSON.parse(headContent);
    const headKeys = flattenKeys(headObj);

    // Categorize
    const added: string[] = [];
    const modified: string[] = [];
    const unchanged: string[] = [];
    const removed: string[] = [];

    for (const [key, value] of Object.entries(stagedKeys)) {
      if (!(key in headKeys)) {
        added.push(key);
      } else if (hashValue(value) !== hashValue(headKeys[key])) {
        modified.push(key);
      } else {
        unchanged.push(key);
      }
    }

    for (const key of Object.keys(headKeys)) {
      if (!(key in stagedKeys)) {
        removed.push(key);
      }
    }

    return { added, modified, removed, unchanged };
  } catch (error) {
    // Fall back to comparing working directory with HEAD
    return detectChangedKeys(filePath, "HEAD");
  }
}

/**
 * Get values for specific keys from a flattened object
 */
export function extractKeyValues(filePath: string, keys: string[]): Record<string, any> {
  const content = fs.readFileSync(filePath, "utf-8");
  const obj = JSON.parse(content);
  const flatKeys = flattenKeys(obj);

  const result: Record<string, any> = {};
  for (const key of keys) {
    if (key in flatKeys) {
      result[key] = flatKeys[key];
    }
  }

  return result;
}

/**
 * Reconstruct nested object from flat dot-notation keys
 * Example: { "nav.dashboard": "Dashboard" } => { nav: { dashboard: "Dashboard" } }
 */
export function unflattenKeys(flatObj: Record<string, any>): any {
  const result: any = {};

  for (const [fullKey, value] of Object.entries(flatObj)) {
    const keys = fullKey.split(".");
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}
