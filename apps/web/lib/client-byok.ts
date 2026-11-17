export type AiProvider = 'gemini' | 'openai' | 'openrouter';

const PREFIX = 'chesswise_byok_';

export function getClientApiKey(provider: AiProvider): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${PREFIX}${provider}`) || null;
  } catch {
    return null;
  }
}

export function saveClientApiKey(provider: AiProvider, key: string, model?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(`${PREFIX}${provider}`, trimmed);
    }
    localStorage.setItem(`${PREFIX}active_provider`, provider);
    if (model !== undefined) {
      localStorage.setItem(`${PREFIX}model`, model.trim());
    }
  } catch (err) {
    console.error('Failed to save API key to localStorage:', err);
  }
}

export function removeClientApiKey(provider: AiProvider): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${PREFIX}${provider}`);
  } catch (err) {
    console.error('Failed to remove API key from localStorage:', err);
  }
}

export function getActiveClientByok(): {
  provider: AiProvider;
  key: string | null;
  customModel: string | null;
} {
  if (typeof window === 'undefined') {
    return { provider: 'gemini', key: null, customModel: null };
  }
  try {
    const provider = (localStorage.getItem(`${PREFIX}active_provider`) as AiProvider) || 'gemini';
    const key = localStorage.getItem(`${PREFIX}${provider}`) || null;
    const customModel = localStorage.getItem(`${PREFIX}model`) || null;
    return { provider, key, customModel };
  } catch {
    return { provider: 'gemini', key: null, customModel: null };
  }
}
