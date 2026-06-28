'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'fetch',    label: 'Fetching page content',           icon: '🌐', duration: 4 },
  { id: 'cms',      label: 'Detecting CMS & platform',        icon: '🔍', duration: 3 },
  { id: 'onpage',   label: 'On-Page SEO analysis',            icon: '📄', duration: 6 },
  { id: 'geo',      label: 'GEO — AI search visibility',      icon: '🤖', duration: 7 },
  { id: 'aeo',      label: 'AEO — Answer engine checks',      icon: '💬', duration: 5 },
  { id: 'pagespeed',label: 'PageSpeed (Core Web Vitals)',      icon: '⚡', duration: 12 },
  { id: 'security', label: 'Security & SSL scan',             icon: '🔒', duration: 5 },
  { id: 'malware',  label: 'Malware check',                   icon: '🛡️', duration: 4 },
  { id: 'score',    label: 'Computing composite score',        icon: '📊', duration: 3 },
];

export default function AuditWaiting({ auditId, url }: { auditId: string; url: string }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const retriedRef = useRef(false);

  // Tick elapsed seconds
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-retry stuck PENDING audit after 15 seconds
  useEffect(() => {
    if (elapsed === 15 && !retriedRef.current) {
      retriedRef.current = true;
      fetch(`/api/audits/${auditId}/retry`, { method: 'POST' }).catch(() => {});
    }
  }, [elapsed, auditId]);

  // Poll audit status every 4 seconds
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/audits/${auditId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setDone(true);
          clearInterval(poll);
          setTimeout(() => router.refresh(), 300);
        }
      } catch { /* silent */ }
    }, 4000);
    return () => clearInterval(poll);
  }, [auditId, router]);

  // Figure out which step is "active" based on elapsed time
  let cumulative = 0;
  const stepStates = STEPS.map((step) => {
    const start = cumulative;
    cumulative += step.duration;
    if (elapsed >= cumulative) return 'done';
    if (elapsed >= start) return 'active';
    return 'pending';
  });

  const totalDuration = STEPS.reduce((a, s) => a + s.duration, 0);
  // After all steps visually complete, pulse between 95-98% so it never looks frozen
  const baseProgress = Math.min(95, Math.round((elapsed / totalDuration) * 100));
  const progress = done ? 100 : elapsed > totalDuration ? 95 + (elapsed % 4 < 2 ? 0 : 3) : baseProgress;

  const domain = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 mb-4 relative">
            <span className="text-2xl">{done ? '✅' : '🔍'}</span>
            {!done && (
              <span className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {done ? 'Audit complete — loading results…' : 'Scanning your website'}
          </h2>
          <p className="text-slate-400 text-sm font-mono">{domain}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{done ? 'Complete' : 'Analyzing…'}</span>
            <span>{done ? '100' : progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000"
              style={{ width: `${done ? 100 : progress}%` }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
          {STEPS.map((step, i) => {
            const state = stepStates[i];
            return (
              <div key={step.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${state === 'active' ? 'bg-blue-600/5' : ''}`}>
                <span className="text-base w-5 text-center shrink-0">{step.icon}</span>
                <span className={`flex-1 text-sm ${state === 'done' ? 'text-slate-500 line-through' : state === 'active' ? 'text-white font-medium' : 'text-slate-600'}`}>
                  {step.label}
                </span>
                <span className="shrink-0 w-5 text-right">
                  {state === 'done' && <span className="text-green-400 text-xs">✓</span>}
                  {state === 'active' && (
                    <span className="inline-block w-3 h-3 rounded-full border border-blue-400 border-t-transparent animate-spin" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-4">
          {elapsed}s elapsed · Audits take 30–90 seconds · Page will refresh automatically
        </p>
      </div>
    </div>
  );
}
