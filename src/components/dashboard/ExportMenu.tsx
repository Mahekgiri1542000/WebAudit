'use client';
import { useState, useRef, useEffect } from 'react';

type PlanTier = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY';

type FormatConfig = {
  id: string;
  label: string;
  desc: string;
  ext: string;
  icon: string;
  requiredPlan: PlanTier | null;
  badge?: string;
  color: string;
};

const FORMATS: FormatConfig[] = [
  {
    id: 'pdf',
    label: 'PDF Report',
    desc: 'Branded report with AI executive summary',
    ext: '.pdf',
    icon: '📄',
    requiredPlan: 'PRO',
    badge: 'AI Summary',
    color: '#dc2626',
  },
  {
    id: 'doc',
    label: 'Word Document',
    desc: 'Detailed report with all checks & tables',
    ext: '.docx',
    icon: '📝',
    requiredPlan: 'STARTER',
    color: '#2563eb',
  },
  {
    id: 'csv',
    label: 'CSV Spreadsheet',
    desc: 'All data for Excel / Google Sheets',
    ext: '.csv',
    icon: '📊',
    requiredPlan: null,
    color: '#16a34a',
  },
  {
    id: 'txt',
    label: 'Plain Text',
    desc: 'Readable summary with ASCII score bars',
    ext: '.txt',
    icon: '📃',
    requiredPlan: null,
    color: '#64748b',
  },
  {
    id: 'json',
    label: 'JSON Data',
    desc: 'Raw structured data for developers',
    ext: '.json',
    icon: '🔧',
    requiredPlan: null,
    color: '#7c3aed',
  },
];

const PLAN_ORDER: PlanTier[] = ['FREE', 'STARTER', 'PRO', 'AGENCY'];

function planRank(tier: PlanTier | null): number {
  if (!tier) return -1;
  return PLAN_ORDER.indexOf(tier);
}

function isLocked(requiredPlan: PlanTier | null, userPlan: PlanTier): boolean {
  if (!requiredPlan) return false;
  return planRank(userPlan) < planRank(requiredPlan);
}

export default function ExportMenu({
  auditId,
  auditUrl,
  planTier = 'FREE',
}: {
  auditId: string;
  auditUrl: string;
  planTier?: PlanTier;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (format: FormatConfig) => {
    setError(null);
    setOpen(false);

    if (isLocked(format.requiredPlan, planTier)) {
      window.location.href = '/dashboard/settings/billing';
      return;
    }

    if (format.id === 'pdf') {
      window.open(`/print/${auditId}`, '_blank');
      return;
    }

    setLoading(format.id);
    try {
      const res = await fetch(`/api/audits/${auditId}/export?format=${format.id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setError(`${format.label} requires ${(body.requiredPlan as string) ?? 'a higher'} plan. Upgrade to unlock.`);
        } else {
          setError('Export failed. Please try again.');
        }
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let slug = 'audit';
      try { slug = new URL(auditUrl).hostname.replace(/\./g, '-'); } catch { /* */ }
      a.download = `webaudit-${slug}${format.ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const lockedFormats = FORMATS.filter(f => isLocked(f.requiredPlan, planTier));
  const unlockedCount = FORMATS.filter(f => !isLocked(f.requiredPlan, planTier)).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); setError(null); }}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0d1526] hover:bg-[#111c35] text-slate-200 text-sm font-semibold rounded-xl border border-slate-700/80 hover:border-[#f07b29]/50 transition-all duration-200 shadow-lg"
      >
        {loading ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-slate-500 border-t-[#f07b29] rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-[#f07b29]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
        Export
        <svg className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#080e1f] border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-800/60">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Export Report</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{unlockedCount} formats available on {planTier} plan</p>
          </div>

          {/* Formats */}
          <div className="p-1.5 space-y-0.5">
            {FORMATS.map((f) => {
              const locked = isLocked(f.requiredPlan, planTier);
              const busy = loading === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleExport(f)}
                  disabled={!!loading}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                    locked
                      ? 'opacity-60 hover:opacity-80 hover:bg-slate-800/30'
                      : 'hover:bg-slate-800/70'
                  } disabled:cursor-not-allowed`}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                    style={{
                      background: locked ? '#1e293b' : `${f.color}18`,
                      border: `1px solid ${locked ? '#334155' : f.color}33`,
                    }}
                  >
                    {busy ? (
                      <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-[#f07b29] rounded-full animate-spin" />
                    ) : locked ? (
                      <span className="text-slate-500 text-sm">🔒</span>
                    ) : (
                      <span>{f.icon}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold ${locked ? 'text-slate-500' : 'text-white'}`}>
                        {f.label}
                      </span>
                      {f.badge && !locked && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                          {f.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${locked ? 'text-slate-600' : 'text-slate-500'}`}>
                      {locked && f.requiredPlan ? `Requires ${f.requiredPlan} plan` : f.desc}
                    </p>
                  </div>

                  {/* Ext / Upgrade */}
                  <div className="shrink-0">
                    {locked ? (
                      <span className="text-[10px] font-bold text-[#f07b29] bg-[#f07b29]/10 px-2 py-0.5 rounded-full border border-[#f07b29]/20">
                        Upgrade
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">{f.ext}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-[11px] text-red-400">{error}</p>
            </div>
          )}

          {/* Footer */}
          {lockedFormats.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-800/60 bg-slate-900/20">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  🔒 {lockedFormats.length} format{lockedFormats.length > 1 ? 's' : ''} locked
                </p>
                <a
                  href="/dashboard/settings/billing"
                  className="text-[11px] font-bold text-[#f07b29] hover:text-orange-300 transition-colors"
                >
                  Upgrade plan →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
