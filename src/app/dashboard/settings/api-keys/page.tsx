'use client';
import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/user/api-keys')
      .then(r => r.json())
      .then(data => { setKeys(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setKeys(prev => [...prev, data.record]);
        setNewKeyName('');
        setShowCreate(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to create API key.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    await fetch(`/api/user/api-keys/${id}`, { method: 'DELETE' });
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">API Keys</h1>
          <p className="text-slate-400 text-sm">Use API keys to authenticate programmatic access to WebAudit.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm"
        >
          + New key
        </button>
      </div>

      {/* New key reveal */}
      {newKey && (
        <div className="mb-6 p-5 rounded-2xl border border-green-500/30 bg-green-500/10">
          <p className="text-green-400 font-bold text-sm mb-2">✓ API key created — copy it now</p>
          <p className="text-slate-400 text-xs mb-3">This key will not be shown again.</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-xs text-white bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-700 break-all">{newKey}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKey); }} className="px-3 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs rounded-xl transition whitespace-nowrap">
              Copy
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-3 text-slate-500 hover:text-slate-300 text-xs transition">
            I&apos;ve copied it — dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 p-5 rounded-2xl border border-slate-700 bg-slate-900/60">
          <h3 className="text-white font-bold mb-4">Create new API key</h3>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Production, CI/CD)"
              required
              className="flex-1 px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition"
            />
            <button type="submit" disabled={creating} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition text-sm">
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-400 rounded-xl transition text-sm">
              Cancel
            </button>
          </form>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
      )}

      {/* Keys list */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
        <h2 className="text-white font-bold mb-5">Your API keys</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : keys.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🔑</div>
            <p className="text-slate-400 text-sm">No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                <div>
                  <p className="text-white font-semibold text-sm">{k.name}</p>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">{k.prefix}••••••••••••••••</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Created {new Date(k.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {k.lastUsed ? ` · Last used ${new Date(k.lastUsed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' · Never used'}
                  </p>
                </div>
                <button onClick={() => handleRevoke(k.id)} className="px-3 py-1.5 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg transition">
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Docs link */}
      <p className="mt-5 text-slate-600 text-sm">
        Need help? See the <a href="/docs" className="text-blue-400 hover:text-blue-300">API documentation →</a>
      </p>
    </div>
  );
}
