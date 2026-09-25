// ============================================================
// ADSUN Dashboard — formatUtils.ts
// Utility functions for formatting numbers, bytes, and rates
// ============================================================

/**
 * Formats a number to a compact string representation (K, M, B, T).
 * Examples:
 * 850 -> 850
 * 12400 -> 12.4k
 * 1540000 -> 1.54M
 * 2100000000 -> 2.1B
 */
export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  
  if (num < 1000) {
    return num.toString();
  }

  const map = [
    { suffix: "T", threshold: 1e12 },
    { suffix: "B", threshold: 1e9 },
    { suffix: "M", threshold: 1e6 },
    { suffix: "k", threshold: 1e3 },
  ];

  for (let i = 0; i < map.length; i++) {
    if (num >= map[i].threshold) {
      const formatted = (num / map[i].threshold).toFixed(2);
      // Remove trailing zeros after decimal point
      const clean = formatted.replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
      return clean + map[i].suffix;
    }
  }

  return num.toString();
}

/**
 * Formats a number with comma separators for exact representation.
 * Example: 1542891 -> 1,542,891
 */
export function formatExactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}
