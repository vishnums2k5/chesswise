import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveApiKey, DEFAULT_MODELS } from './llm-provider';

describe('llm-provider (Multi-Provider BYOK Resolver)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('prefers custom key when valid and unmasked', () => {
    process.env.GEMINI_API_KEY = 'server-key';
    const key = resolveApiKey('gemini', 'user-custom-key-1234');
    expect(key).toBe('user-custom-key-1234');
  });

  it('falls back to environment variable when custom key is masked or empty', () => {
    process.env.GEMINI_API_KEY = 'server-gemini-key';
    expect(resolveApiKey('gemini', 'AIza••••••••cdef')).toBe('server-gemini-key');
    expect(resolveApiKey('gemini', '')).toBe('server-gemini-key');
    expect(resolveApiKey('gemini', null)).toBe('server-gemini-key');
  });

  it('resolves OpenAI and OpenRouter environment fallbacks', () => {
    process.env.OPENAI_API_KEY = 'server-openai-key';
    process.env.OPENROUTER_API_KEY = 'server-openrouter-key';

    expect(resolveApiKey('openai', null)).toBe('server-openai-key');
    expect(resolveApiKey('openrouter', null)).toBe('server-openrouter-key');
  });

  it('provides sensible default models for all providers', () => {
    expect(DEFAULT_MODELS.gemini).toBe('gemini-2.5-flash');
    expect(DEFAULT_MODELS.openai).toBe('gpt-4o-mini');
    expect(DEFAULT_MODELS.openrouter).toBe('meta-llama/llama-3.3-70b-instruct');
  });
});
