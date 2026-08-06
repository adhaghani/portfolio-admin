/**
 * Estimate reading time in minutes based on a ~200 words-per-minute pace.
 * Always returns at least 1 minute.
 */
export function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
