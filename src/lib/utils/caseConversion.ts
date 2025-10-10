/**
 * Case Conversion Utilities
 *
 * Utilities for converting between camelCase and snake_case for database/API compatibility
 */

/**
 * Converts snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 */
export function camelCaseKeys<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelCaseKeys(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = camelCaseKeys(obj[key]);
      return acc;
    }, {} as any) as T;
  }

  return obj;
}

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 */
export function snakeCaseKeys<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeCaseKeys(item)) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = snakeCaseKeys(obj[key]);
      return acc;
    }, {} as any) as T;
  }

  return obj;
}
