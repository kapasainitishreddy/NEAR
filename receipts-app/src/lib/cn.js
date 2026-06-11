// Tiny classnames joiner — keeps JSX tidy without extra deps.
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}
