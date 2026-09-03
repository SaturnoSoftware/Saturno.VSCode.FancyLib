/**
 * Clamps a numeric value between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalizes an integer value within a specified range.
 * If the value is not finite, returns the default value.
 */
export function normalizeInteger(
  value: number | undefined,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (!Number.isFinite(value)) {
    return defaultValue;
  }
  return clamp(Math.trunc(value as number), min, max);
}

/**
 * Normalizes a single character string.
 * If the input is empty or undefined, returns the default value.
 */
export function normalizeChar(
  char: string | undefined,
  defaultValue: string
): string {
  if (!char || char.length === 0) {
    return defaultValue;
  }
  return char[0];
}

/**
 * Normalizes an array of strings.
 * Filters out non-string elements and removes carriage returns.
 */
export function normalizeStringArray(
  arr: string[] | undefined,
  defaultValue: string[]
): string[] {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [...defaultValue];
  }

  return arr
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/\r/g, ""));
}
