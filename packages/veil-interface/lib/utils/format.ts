/**
 * Truncates a string by keeping a certain number of characters at the start and end
 * @param s The string to truncate
 * @param start Number of characters to keep at the start
 * @param end Number of characters to keep at the end
 * @returns The truncated string
 */
export function truncateString(s: string | null | undefined, start = 6, end = 4) {
  if (start < 0 || end < 0) throw new Error("Invalid position")
  if (!s) return ""
  if (s.length <= start + end) return s
  return s.slice(0, start) + "..." + s.slice(s.length - end)
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param string The string to escape
 * @returns The escaped string
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}
