'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Save,
  Check,
  User,
  Globe,
  Zap,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

type AiProvider = 'gemini' | 'openai' | 'openrouter';

interface Settings {
  displayName: string | null;
  avatarUrl: string | null;
  email: string;
  lichessUsername: string | null;
  chessComUsername: string | null;
  xp: number;
  level: number;
  aiProvider: AiProvider;
  customModel: string;
  hasGeminiApiKey: boolean;
  geminiApiKeyMasked: string | null;
  hasOpenaiApiKey: boolean;
  openaiApiKeyMasked: string | null;
  hasOpenrouterApiKey: boolean;
  openrouterApiKeyMasked: string | null;
}

const PROVIDER_METADATA: Record<
  AiProvider,
  {
    name: string;
    tagline: string;
    keyPlaceholder: string;
    linkUrl: string;
    linkLabel: string;
    presetModels: { value: string; label: string }[];
  }
> = {
  gemini: {
    name: 'Google Gemini',
    tagline: 'Google AI Studio — Fast, grounded Socratic coaching with high free-tier limits',
    keyPlaceholder: 'AIzaSy...',
    linkUrl: 'https://aistudio.google.com/app/apikey',
    linkLabel: 'Get a free Gemini API key on Google AI Studio',
    presetModels: [
      { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Recommended, ultra-fast)' },
      { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Deep Grandmaster reasoning)' },
      { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash (Next-gen Gemini)' },
    ],
  },
  openai: {
    name: 'OpenAI',
    tagline: 'OpenAI API — GPT-4o & GPT-4o-mini with deep reasoning and sharp tactical intuition',
    keyPlaceholder: 'sk-proj-...',
    linkUrl: 'https://platform.openai.com/api-keys',
    linkLabel: 'Get an OpenAI API key on platform.openai.com',
    presetModels: [
      { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Fast, cost-effective)' },
      { value: 'gpt-4o', label: 'gpt-4o (High-intelligence flagship)' },
      { value: 'o3-mini', label: 'o3-mini (Advanced math & tactical reasoning)' },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    tagline: 'Universal Gateway — Run Claude 3.5 Sonnet, Llama 3, DeepSeek, or any open model',
    keyPlaceholder: 'sk-or-v1-...',
    linkUrl: 'https://openrouter.ai/keys',
    linkLabel: 'Get an OpenRouter API key on openrouter.ai/keys',
    presetModels: [
      {
        value: 'meta-llama/llama-3.3-70b-instruct',
        label: 'Llama 3.3 70B Instruct (Top open model)',
      },
      { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Nuanced Socratic coach)' },
      { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (V3 reasoning)' },
      {
        value: 'google/gemini-2.0-flash-exp:free',
        label: 'Gemini 2.0 Flash (OpenRouter Free Tier)',
      },
    ],
  },
};

function SettingField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          'w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-xs text-foreground',
          'placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          readOnly && 'cursor-not-allowed bg-muted/20 opacity-60',
        )}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    displayName: '',
    avatarUrl: '',
    lichessUsername: '',
    chessComUsername: '',
    aiProvider: 'gemini' as AiProvider,
    customModel: '',
    geminiApiKey: '',
    openaiApiKey: '',
    openrouterApiKey: '',
    removeGeminiApiKey: false,
    removeOpenaiApiKey: false,
    removeOpenrouterApiKey: false,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Key visibility toggles
  const [showKey, setShowKey] = useState(false);

  // Key replacement state (when key is already saved)
  const [isReplacingKey, setIsReplacingKey] = useState<Record<AiProvider, boolean>>({
    gemini: false,
    openai: false,
    openrouter: false,
  });
  const [savingAiKey, setSavingAiKey] = useState(false);
  const [aiKeySavedSuccess, setAiKeySavedSuccess] = useState(false);

  // Key testing state
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          setForm((prev) => ({
            ...prev,
            displayName: d.settings.displayName ?? '',
            avatarUrl: d.settings.avatarUrl ?? '',
            lichessUsername: d.settings.lichessUsername ?? '',
            chessComUsername: d.settings.chessComUsername ?? '',
            aiProvider: d.settings.aiProvider || 'gemini',
            customModel: d.settings.customModel || '',
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const payload: Record<string, any> = {
        displayName: form.displayName,
        avatarUrl: form.avatarUrl,
        lichessUsername: form.lichessUsername,
        chessComUsername: form.chessComUsername,
        aiProvider: form.aiProvider,
        customModel: form.customModel,
      };

      if (form.removeGeminiApiKey) payload.removeGeminiApiKey = true;
      else if (form.geminiApiKey) payload.geminiApiKey = form.geminiApiKey;

      if (form.removeOpenaiApiKey) payload.removeOpenaiApiKey = true;
      else if (form.openaiApiKey) payload.openaiApiKey = form.openaiApiKey;

      if (form.removeOpenrouterApiKey) payload.removeOpenrouterApiKey = true;
      else if (form.openrouterApiKey) payload.openrouterApiKey = form.openrouterApiKey;

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => (prev ? { ...prev, ...data.settings } : data.settings));
          // Reset key input fields to empty since they are now stored
          setForm((prev) => ({
            ...prev,
            geminiApiKey: '',
            openaiApiKey: '',
            openrouterApiKey: '',
            removeGeminiApiKey: false,
            removeOpenaiApiKey: false,
            removeOpenrouterApiKey: false,
          }));
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAiKey = async () => {
    setSavingAiKey(true);
    setAiKeySavedSuccess(false);

    try {
      const provider = form.aiProvider;
      let keyToSave = '';
      if (provider === 'gemini') keyToSave = form.geminiApiKey;
      else if (provider === 'openai') keyToSave = form.openaiApiKey;
      else if (provider === 'openrouter') keyToSave = form.openrouterApiKey;

      const payload: Record<string, any> = {
        aiProvider: provider,
        customModel: form.customModel,
      };

      if (provider === 'gemini') {
        if (form.removeGeminiApiKey) payload.removeGeminiApiKey = true;
        else if (keyToSave) payload.geminiApiKey = keyToSave;
      } else if (provider === 'openai') {
        if (form.removeOpenaiApiKey) payload.removeOpenaiApiKey = true;
        else if (keyToSave) payload.openaiApiKey = keyToSave;
      } else if (provider === 'openrouter') {
        if (form.removeOpenrouterApiKey) payload.removeOpenrouterApiKey = true;
        else if (keyToSave) payload.openrouterApiKey = keyToSave;
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => (prev ? { ...prev, ...data.settings } : data.settings));
          setForm((prev) => ({
            ...prev,
            geminiApiKey: '',
            openaiApiKey: '',
            openrouterApiKey: '',
            removeGeminiApiKey: false,
            removeOpenaiApiKey: false,
            removeOpenrouterApiKey: false,
          }));
          setIsReplacingKey((prev) => ({ ...prev, [provider]: false }));
        }
        setAiKeySavedSuccess(true);
        setTimeout(() => setAiKeySavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save AI key:', err);
    } finally {
      setSavingAiKey(false);
    }
  };

  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);

    try {
      const provider = form.aiProvider;
      let activeKeyInput = '';
      if (provider === 'gemini') activeKeyInput = form.geminiApiKey;
      else if (provider === 'openai') activeKeyInput = form.openaiApiKey;
      else if (provider === 'openrouter') activeKeyInput = form.openrouterApiKey;

      const res = await fetch('/api/settings/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: activeKeyInput || undefined,
          customModel: form.customModel || undefined,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setTestResult({ ok: true, message: data.message });
      } else {
        setTestResult({
          ok: false,
          message: data.error || data.message || 'Key validation failed.',
        });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message || 'Network error while testing key.' });
    } finally {
      setTestingKey(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading account preferences…</p>
      </div>
    );
  }

  const activeProviderMeta = PROVIDER_METADATA[form.aiProvider];

  // Helper to check if the currently selected provider has a saved key in the DB
  const hasSavedKeyForProvider =
    form.aiProvider === 'gemini'
      ? settings?.hasGeminiApiKey && !form.removeGeminiApiKey
      : form.aiProvider === 'openai'
        ? settings?.hasOpenaiApiKey && !form.removeOpenaiApiKey
        : settings?.hasOpenrouterApiKey && !form.removeOpenrouterApiKey;

  const maskedKeyForProvider =
    form.aiProvider === 'gemini'
      ? settings?.geminiApiKeyMasked
      : form.aiProvider === 'openai'
        ? settings?.openaiApiKeyMasked
        : settings?.openrouterApiKeyMasked;

  const currentEnteredKey =
    form.aiProvider === 'gemini'
      ? form.geminiApiKey
      : form.aiProvider === 'openai'
        ? form.openaiApiKey
        : form.openrouterApiKey;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Account &amp; Engine Settings
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your personal chess identity, external platform sync, and Bring-Your-Own-Key (BYOK)
          AI preferences.
        </p>
      </div>

      {/* AI & RAG Configuration (BYOK) */}
      <section className="space-y-5 rounded-2xl border border-primary/30 bg-gradient-to-b from-card via-card/90 to-primary/5 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              AI &amp; RAG Coach Configuration (BYOK)
            </h2>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Bring Your Own Key
          </span>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Connect your personal API key from Google AI Studio, OpenAI, or OpenRouter to power the
          interactive Socratic AI Coach and deep blunder analysis.
        </p>

        {/* Provider Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Select Active AI Provider</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(['gemini', 'openai', 'openrouter'] as AiProvider[]).map((prov) => {
              const isSelected = form.aiProvider === prov;
              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, aiProvider: prov }));
                    setTestResult(null);
                  }}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/60 bg-background/40 hover:border-primary/40 hover:bg-card',
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {prov === 'gemini'
                        ? 'Google Gemini'
                        : prov === 'openai'
                          ? 'OpenAI'
                          : 'OpenRouter'}
                    </span>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {prov === 'gemini'
                      ? 'Google AI Studio (Recommended)'
                      : prov === 'openai'
                        ? 'GPT-4o & GPT-4o-mini'
                        : 'Claude, Llama & DeepSeek'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider Guidance Banner */}
        <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
          <p className="text-xs font-medium text-foreground">{activeProviderMeta.tagline}</p>
          <a
            href={activeProviderMeta.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            <span>{activeProviderMeta.linkLabel}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* API Key Management Area */}
        <div className="space-y-3">
          {hasSavedKeyForProvider && !isReplacingKey[form.aiProvider] ? (
            /* Active Stored Key Banner - Crystal clear visual proof that the key is saved */
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 transition-all">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {activeProviderMeta.name} Connected
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <Check className="h-3 w-3" /> Saved in Database
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      Stored Key:{' '}
                      <span className="font-semibold text-foreground">{maskedKeyForProvider}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={testingKey}
                    className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-card active:scale-95 disabled:opacity-50"
                  >
                    {testingKey ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-primary" />
                    )}
                    <span>{testingKey ? 'Testing…' : 'Test Key'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingKey((p) => ({ ...p, [form.aiProvider]: true }));
                      setTestResult(null);
                    }}
                    className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 active:scale-95"
                  >
                    Replace Key
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const payload: Record<string, any> = { aiProvider: form.aiProvider };
                      if (form.aiProvider === 'gemini') payload.removeGeminiApiKey = true;
                      if (form.aiProvider === 'openai') payload.removeOpenaiApiKey = true;
                      if (form.aiProvider === 'openrouter') payload.removeOpenrouterApiKey = true;
                      const res = await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.settings)
                          setSettings((prev) =>
                            prev ? { ...prev, ...data.settings } : data.settings,
                          );
                      }
                      setTestResult(null);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 active:scale-95"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Key Input & Save Form */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {isReplacingKey[form.aiProvider]
                      ? `Replace ${activeProviderMeta.name} API Key`
                      : `Enter ${activeProviderMeta.name} API Key`}
                  </span>
                </label>
                {isReplacingKey[form.aiProvider] && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingKey((p) => ({ ...p, [form.aiProvider]: false }));
                      setForm((f) => ({
                        ...f,
                        geminiApiKey: '',
                        openaiApiKey: '',
                        openrouterApiKey: '',
                      }));
                      setTestResult(null);
                    }}
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel Replacement
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={currentEnteredKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((f) => ({
                      ...f,
                      geminiApiKey: f.aiProvider === 'gemini' ? val : f.geminiApiKey,
                      openaiApiKey: f.aiProvider === 'openai' ? val : f.openaiApiKey,
                      openrouterApiKey: f.aiProvider === 'openrouter' ? val : f.openrouterApiKey,
                      removeGeminiApiKey: f.aiProvider === 'gemini' ? false : f.removeGeminiApiKey,
                      removeOpenaiApiKey: f.aiProvider === 'openai' ? false : f.removeOpenaiApiKey,
                      removeOpenrouterApiKey:
                        f.aiProvider === 'openrouter' ? false : f.removeOpenrouterApiKey,
                    }));
                    setTestResult(null);
                  }}
                  placeholder={activeProviderMeta.keyPlaceholder}
                  className="w-full rounded-xl border border-border/70 bg-background/60 py-2.5 pl-3.5 pr-20 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Direct Save & Test Buttons in the BYOK Section */}
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAiKey}
                    disabled={savingAiKey || !currentEnteredKey.trim()}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                  >
                    {savingAiKey ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>{savingAiKey ? 'Saving to Database…' : 'Save & Activate Key'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={testingKey || !currentEnteredKey.trim()}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-card active:scale-95 disabled:opacity-50"
                  >
                    {testingKey ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{testingKey ? 'Testing connection…' : 'Test Key Connection'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Persisted in private PostgreSQL record</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Saved Success Banner */}
        {aiKeySavedSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              API key saved successfully to your database record! It is now permanently active
              across sessions and page refreshes.
            </span>
          </div>
        )}

        {/* Model Selection / Custom Model Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Model Preference</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={
                activeProviderMeta.presetModels.some((m) => m.value === form.customModel)
                  ? form.customModel
                  : form.customModel
                    ? 'custom'
                    : activeProviderMeta.presetModels[0]?.value
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val !== 'custom') {
                  setForm((f) => ({ ...f, customModel: val }));
                }
              }}
              className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {activeProviderMeta.presetModels.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
              <option value="custom">Custom Model Identifier…</option>
            </select>

            <input
              type="text"
              value={form.customModel}
              onChange={(e) => setForm((f) => ({ ...f, customModel: e.target.value }))}
              placeholder="Or enter custom model ID..."
              className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Test Result Message Banner with One-Click Save */}
        {testResult && (
          <div
            className={cn(
              'flex flex-col gap-2.5 rounded-xl border p-3 text-xs animate-in fade-in',
              testResult.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400',
            )}
          >
            <div className="flex items-start gap-2.5">
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
            {testResult.ok && currentEnteredKey.trim() && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={handleSaveAiKey}
                  disabled={savingAiKey}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingAiKey ? 'Saving…' : 'Save & Activate This Verified Key'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Profile Section */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">User Profile</h2>
        </div>

        {form.avatarUrl && (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.avatarUrl}
              alt="Avatar preview"
              className="h-12 w-12 rounded-full border border-primary/40 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p className="text-[11px] text-muted-foreground">Live avatar preview</p>
          </div>
        )}

        <SettingField
          label="Display Name"
          placeholder="Your grandmaster handle"
          value={form.displayName}
          onChange={(v) => setForm((f) => ({ ...f, displayName: v }))}
        />
        <SettingField
          label="Email Address"
          value={settings?.email ?? ''}
          readOnly
          hint="Managed via Supabase Auth identity."
        />
        <SettingField
          label="Avatar Image URL"
          placeholder="https://example.com/avatar.png"
          hint="Public HTTPS link for your profile picture."
          value={form.avatarUrl}
          onChange={(v) => setForm((f) => ({ ...f, avatarUrl: v }))}
        />
      </section>

      {/* External Platforms */}
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Platform Integrations</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Pre-fills the PGN Importer so you can fetch matches from Lichess and Chess.com with 1
          click.
        </p>
        <SettingField
          label="Lichess Username"
          placeholder="e.g. magnuscarlsen"
          value={form.lichessUsername}
          onChange={(v) => setForm((f) => ({ ...f, lichessUsername: v }))}
        />
        <SettingField
          label="Chess.com Username"
          placeholder="e.g. hikaru"
          value={form.chessComUsername}
          onChange={(v) => setForm((f) => ({ ...f, chessComUsername: v }))}
        />
      </section>

      {/* Experience & Level */}
      {settings && (
        <section className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Level Status</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 font-mono text-base font-bold text-primary">
              Lv {settings.level}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Level {settings.level} Tactician
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {settings.xp.toLocaleString()} XP accumulated
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving changes…' : 'Save Changes'}</span>
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 animate-in fade-in">
            <Check className="h-4 w-4" />
            <span>Preferences updated</span>
          </span>
        )}
      </div>
    </div>
  );
}
