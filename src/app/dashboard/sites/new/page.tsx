'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ScopeType = 'exact' | 'path' | 'domain' | 'subdomains';
type Protocol = 'http + https' | 'https://' | 'http://';

const SCOPE_OPTIONS: { id: ScopeType; label: string; desc: string; example: string }[] = [
  { id: 'exact', label: 'Exact URL', desc: 'Only specified URL', example: 'example.com/path/' },
  { id: 'path', label: 'Path', desc: 'Path including subfolders', example: 'example.com/path/*' },
  { id: 'domain', label: 'Domain', desc: 'Only specified domain', example: 'example.com/*' },
  { id: 'subdomains', label: 'Subdomains', desc: 'Domain including subdomains', example: '*.example.com/*' },
];

export default function NewSitePage() {
  const [domain, setDomain] = useState('');
  const [projectName, setProjectName] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('subdomains');
  const [protocol, setProtocol] = useState<Protocol>('http + https');
  const [scanFrequency, setScanFrequency] = useState('WEEKLY');
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const [showProtoMenu, setShowProtoMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const currentScope = SCOPE_OPTIONS.find((s) => s.id === scopeType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError('');

    const url = domain.includes('://') ? domain.trim() : `https://${domain.trim()}`;

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          name: projectName || domain,
          scanFrequency,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to add site');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/sites/${data.id}`);
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="flex items-center px-8 py-4 border-b border-gray-800">
        <Link href="/dashboard/sites" className="text-gray-500 text-sm hover:text-gray-300 transition mr-4">← Back</Link>
        <div className="flex items-center gap-3">
          {['Scope', 'Monitoring', 'Keywords'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                ${i === 0 ? 'bg-[#f07b29] text-white' : 'text-gray-600'}`}>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold
                  ${i === 0 ? 'border-white text-white' : 'border-gray-700 text-gray-700'}`}>
                  {i + 1}
                </span>
                {step}
              </div>
              {i < 2 && <div className="flex gap-0.5">{[0,1].map((d) => <div key={d} className="w-1 h-1 rounded-full bg-gray-800" />)}</div>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Create your first project</h1>
        <p className="text-gray-400 text-sm mb-10 text-center">Set up your website to start analyzing it.</p>

        {error && (
          <div className="mb-4 w-full max-w-lg p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <div className="w-full max-w-lg bg-[#111827] border border-gray-700 rounded-2xl p-8 space-y-6">
          {/* Scope row */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scope</label>
            <div className="flex gap-2">
              {/* Protocol selector */}
              <div className="relative">
                <button type="button"
                  onClick={() => { setShowProtoMenu(!showProtoMenu); setShowScopeMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-[#1f2937] border border-gray-600 rounded-lg text-white text-sm hover:border-gray-500 transition whitespace-nowrap">
                  {protocol}
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showProtoMenu && (
                  <div className="absolute top-full mt-1 left-0 bg-[#1f2937] border border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden w-36">
                    {(['http + https', 'https://', 'http://'] as Protocol[]).map((p) => (
                      <button key={p} type="button" onClick={() => { setProtocol(p); setShowProtoMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition ${protocol === p ? 'text-[#f07b29]' : 'text-white'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Domain input */}
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Domain or path"
                className="flex-1 min-w-0 px-3 py-2.5 bg-[#1f2937] border border-[#f07b29] rounded-lg text-white placeholder-gray-600 focus:outline-none text-sm"
                autoFocus
                required
              />

              {/* Scope type selector */}
              <div className="relative">
                <button type="button"
                  onClick={() => { setShowScopeMenu(!showScopeMenu); setShowProtoMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-[#1f2937] border border-gray-600 rounded-lg text-white text-sm hover:border-gray-500 transition whitespace-nowrap">
                  {currentScope.label}
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showScopeMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-[#1f2937] border border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden w-64">
                    {SCOPE_OPTIONS.map((opt) => (
                      <button key={opt.id} type="button"
                        onClick={() => { setScopeType(opt.id); setShowScopeMenu(false); }}
                        className={`w-full text-left px-4 py-3.5 hover:bg-gray-700 transition border-b border-gray-700/50 last:border-0
                          ${scopeType === opt.id ? 'bg-[#f07b29]/10' : ''}`}>
                        <p className={`text-sm font-semibold ${scopeType === opt.id ? 'text-[#f07b29]' : 'text-white'}`}>{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                        <p className="text-xs text-gray-600 mt-0.5 font-mono">{opt.example}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              We recommend using &quot;http + https&quot; with the non-www version of your domain for the most complete profile.
            </p>
          </div>

          {/* Project name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={domain || 'My Project'}
              className="w-full px-3 py-2.5 bg-[#1f2937] border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#f07b29] text-sm transition"
            />
          </div>

          {/* Scan frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scan Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' },
              ].map((f) => (
                <button key={f.value} type="button"
                  onClick={() => setScanFrequency(f.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition text-sm
                    ${scanFrequency === f.value
                      ? 'border-[#f07b29] bg-[#f07b29]/10 text-[#f07b29]'
                      : 'border-gray-700 bg-[#1f2937] text-gray-400 hover:border-gray-600'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                    ${scanFrequency === f.value ? 'border-[#f07b29]' : 'border-gray-600'}`}>
                    {scanFrequency === f.value && <div className="w-1.5 h-1.5 rounded-full bg-[#f07b29]" />}
                  </div>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Folder placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Folder</label>
            <div className="w-full px-3 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-500 text-sm flex items-center justify-between">
              None
              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Access info */}
          <div className="flex items-center gap-3 py-3 border-t border-gray-700/50">
            <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-500 text-sm">Shared with all workspace members</span>
            <button type="button" className="text-[#f07b29] text-xs font-medium ml-auto">Manage access</button>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="px-12 py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-bold rounded-xl transition disabled:opacity-40 text-sm"
          >
            {loading ? 'Adding...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
