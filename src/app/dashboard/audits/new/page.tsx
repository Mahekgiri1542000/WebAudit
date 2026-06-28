'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CMS_OPTIONS = [
  { value: 'AUTO', label: 'Auto-detect' },
  { value: 'WORDPRESS', label: 'WordPress' },
  { value: 'SHOPIFY', label: 'Shopify' },
  { value: 'NEXTJS', label: 'Next.js' },
  { value: 'GHL', label: 'GoHighLevel' },
  { value: 'WEBFLOW', label: 'Webflow' },
  { value: 'WIX', label: 'Wix' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewAuditPage() {
  const [url, setUrl] = useState('');
  const [platformHint, setPlatformHint] = useState('AUTO');
  const [industryHint, setIndustryHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, platformHint, industryHint: industryHint || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PLAN_LIMIT') {
          setError('Audit limit reached. Upgrade your plan to continue.');
        } else {
          setError(data.error ?? 'Failed to start audit');
        }
        setLoading(false);
        return;
      }

      router.push(`/dashboard/audits/${data.auditId}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Run New Audit</h1>
        <p className="text-slate-400 text-sm mb-8">Enter a URL to get a full 7-category website report</p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Website URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Platform / CMS</label>
            <select
              value={platformHint}
              onChange={(e) => setPlatformHint(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {CMS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Industry (optional — improves AI suggestions)</label>
            <input
              type="text"
              value={industryHint}
              onChange={(e) => setIndustryHint(e.target.value)}
              placeholder="e.g. HVAC, SaaS, ecommerce, dentist..."
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm"
          >
            {loading ? '⏳ Starting audit...' : 'Run Audit →'}
          </button>
        </form>

        <p className="text-slate-600 text-xs text-center mt-4">
          Audits take 30–90 seconds depending on PageSpeed API response time
        </p>
      </div>
    </div>
  );
}
