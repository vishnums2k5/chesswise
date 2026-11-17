import { describe, it, expect } from 'vitest';
import { maskApiKey, isLikelyApiKey } from './key-security';

describe('key-security (BYOK Security Utilities)', () => {
  it('masks standard Google AI Studio and OpenAI API keys', () => {
    expect(maskApiKey('AIzaSyB1234567890abcdef')).toBe('AIza••••••••cdef');
    expect(maskApiKey('sk-proj-1234567890abcdef')).toBe('sk-p••••••••cdef');
  });

  it('handles null, undefined, and empty string safely', () => {
    expect(maskApiKey(null)).toBeNull();
    expect(maskApiKey(undefined)).toBeNull();
    expect(maskApiKey('')).toBeNull();
  });

  it('masks very short keys gracefully', () => {
    expect(maskApiKey('abc')).toBe('••••••••');
  });

  it('validates whether a key is likely a real key and not masked', () => {
    expect(isLikelyApiKey('AIzaSyB1234567890abcdef')).toBe(true);
    expect(isLikelyApiKey('AIza••••••••cdef')).toBe(false);
    expect(isLikelyApiKey('')).toBe(false);
    expect(isLikelyApiKey(null)).toBe(false);
  });
});
