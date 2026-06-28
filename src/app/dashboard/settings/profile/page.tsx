'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setEmail(session.user.email ?? '');
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSaved(true);
        await update({ name });
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to save profile.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your name and account details.</p>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-2xl font-black text-white shrink-0">
              {name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Profile picture</p>
              <p className="text-slate-500 text-xs mt-0.5">Avatar is generated from your initials.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-slate-600 text-xs mt-1.5">Email cannot be changed. Contact support if needed.</p>
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-green-400 text-sm">✓ Saved</span>}
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-12 p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
        <h2 className="text-red-400 font-bold mb-1">Danger zone</h2>
        <p className="text-slate-400 text-sm mb-4">Permanently delete your account and all your data. This cannot be undone.</p>
        <button className="px-5 py-2.5 border border-red-500/40 hover:bg-red-500/10 text-red-400 font-semibold rounded-xl transition text-sm">
          Delete my account
        </button>
      </div>
    </div>
  );
}
