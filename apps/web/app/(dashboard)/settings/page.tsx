'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Save, Check, User, Globe, Zap } from 'lucide-react';

interface Settings {
  displayName: string | null;
  avatarUrl: string | null;
  email: string;
  lichessUsername: string | null;
  chessComUsername: string | null;
  xp: number;
  level: number;
}

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
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          setForm({
            displayName: d.settings.displayName ?? '',
            avatarUrl: d.settings.avatarUrl ?? '',
            lichessUsername: d.settings.lichessUsername ?? '',
            chessComUsername: d.settings.chessComUsername ?? '',
          });
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
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading account preferences…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Account &amp; Engine Settings
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your personal chess identity and external platform sync preferences.
        </p>
      </div>

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
