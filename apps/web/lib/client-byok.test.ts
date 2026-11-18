import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveClientApiKey,
  getClientApiKey,
  removeClientApiKey,
  getActiveClientByok,
} from './client-byok';

describe('client-byok localStorage manager', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, value: string) => {
        mockStore[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = mockStorage;
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
  });

  it('saves and retrieves an API key from localStorage', () => {
    saveClientApiKey('gemini', 'AIzaSyTestKey123', 'gemini-2.5-flash');
    expect(getClientApiKey('gemini')).toBe('AIzaSyTestKey123');
    const active = getActiveClientByok();
    expect(active.provider).toBe('gemini');
    expect(active.key).toBe('AIzaSyTestKey123');
    expect(active.customModel).toBe('gemini-2.5-flash');
  });

  it('removes an API key from localStorage', () => {
    saveClientApiKey('openai', 'sk-proj-test1234');
    expect(getClientApiKey('openai')).toBe('sk-proj-test1234');
    removeClientApiKey('openai');
    expect(getClientApiKey('openai')).toBeNull();
  });

  it('switches active provider and maintains keys independently', () => {
    saveClientApiKey('gemini', 'gemini-key');
    saveClientApiKey('openrouter', 'openrouter-key');
    expect(getClientApiKey('gemini')).toBe('gemini-key');
    expect(getClientApiKey('openrouter')).toBe('openrouter-key');
    const active = getActiveClientByok();
    expect(active.provider).toBe('openrouter');
    expect(active.key).toBe('openrouter-key');
  });
});
