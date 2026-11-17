/**
 * Mask an API key so it is never exposed in plaintext to the frontend.
 * e.g. "AIzaSyB1234567890abcdef" -> "AIza••••••••cdef"
 */
export function maskApiKey(key?: string | null): string | null {
  if (!key || typeof key !== 'string') return null;
  const trimmed = key.trim();
  if (trimmed.length < 8) return '••••••••';
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

/**
 * Basic format validation for API keys.
 */
export function isLikelyApiKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.length >= 8 && !trimmed.includes('••••');
}
