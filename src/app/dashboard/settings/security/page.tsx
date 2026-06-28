'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SecuritySettingsPage() {
  const { data: session } = useSession();
  const isOAuth = !session?.user?.email?.endsWith('@'); // heuristic — real check would use provider info

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirm) { setError('New passwords do not match.'); return; }
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, newPassword: newPass }),
      });
      if (res.ok) {
        setSaved(true);
        setCurrent(''); setNewPass(''); setConfirm('');
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to update password. Check your current password.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Security</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your password and account security.</p>

      {/* Password change */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 mb-6">
        <h2 className="text-white font-bold mb-4">Change password</h2>

        {session?.user && !session.user.image?.includes('google') ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current password</label>
              <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required placeholder="Your current password"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8} placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm new password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat new password"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition text-sm">
                {saving ? 'Updating…' : 'Update password'}
              </button>
              {saved && <span className="text-green-400 text-sm">✓ Password updated</span>}
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-300 text-sm">You signed in with Google OAuth. Password changes are managed through your Google account.</p>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 mb-6">
        <h2 className="text-white font-bold mb-4">Active sessions</h2>
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div>
            <p className="text-white text-sm font-semibold">Current session</p>
            <p className="text-slate-500 text-xs mt-0.5">This browser — active now</p>
          </div>
          <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
        </div>
        <button className="mt-4 text-sm text-red-400 hover:text-red-300 transition">Sign out all other sessions</button>
      </div>

      {/* 2FA placeholder */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold">Two-factor authentication</h2>
            <p className="text-slate-400 text-sm mt-1">Add an extra layer of security to your account.</p>
          </div>
          <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
