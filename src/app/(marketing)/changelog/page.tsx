import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — WebAudit',
  description: 'Track every improvement, new feature, and bug fix shipped to WebAudit.',
  openGraph: { title: 'WebAudit Changelog', description: 'What\'s new and improved in WebAudit.' },
};

const ENTRIES = [
  {
    date: '2026-06-20',
    version: 'v3.8.0',
    type: 'Feature',
    title: 'AI Executive Summary in PDF Reports',
    items: [
      'PRO and Agency plans now get a Claude-powered executive summary on every exported PDF',
      'Summary covers top wins, critical issues, and a 3-step action plan',
      'Accessible from the Export menu → PDF on any audit detail page',
    ],
  },
  {
    date: '2026-06-14',
    version: 'v3.7.2',
    type: 'Improvement',
    title: 'DOC Export Redesign',
    items: [
      'Completely redesigned Word-compatible HTML export with branded cover page',
      'Score boxes with colour-coded performance indicators',
      'Full check tables, security headers, GEO signals, and action plan sections',
    ],
  },
  {
    date: '2026-06-07',
    version: 'v3.7.1',
    type: 'Fix',
    title: 'Audit Email Notifications',
    items: [
      'Fixed welcome email not sending on Google OAuth first login',
      'Audit-complete emails now include all category scores (SEO, GEO, Speed, Security)',
      'Email gracefully skips if API key is not configured — no longer throws server error',
    ],
  },
  {
    date: '2026-05-28',
    version: 'v3.7.0',
    type: 'Feature',
    title: 'GEO Score v2 — AI Crawler Signals',
    items: [
      'Added GPTBot and ClaudeBot crawlability checks to GEO module',
      'New llms.txt detection with actionable guidance',
      'AI citation readiness score now factors in author schema and E-E-A-T signals',
    ],
  },
  {
    date: '2026-05-15',
    version: 'v3.6.3',
    type: 'Improvement',
    title: 'Dashboard Performance',
    items: [
      'Audit list page now loads 3x faster with server-side pagination',
      'Score history chart renders progressively — no more loading flash',
      'Reduced API calls per dashboard page load by 40%',
    ],
  },
  {
    date: '2026-05-01',
    version: 'v3.6.0',
    type: 'Feature',
    title: 'Plan-Based Export Controls',
    items: [
      'Free plan: CSV, TXT, JSON exports',
      'Starter plan: + DOC export',
      'PRO/Agency plan: + PDF with AI summary',
      'Export menu now shows lock icons and upgrade prompts for restricted formats',
    ],
  },
  {
    date: '2026-04-18',
    version: 'v3.5.2',
    type: 'Fix',
    title: 'SSL Grade & Malware Scan Fixes',
    items: [
      'Fixed SSL grade display showing incorrect value for A-rated certificates',
      'Malware scan now correctly reports clean/flagged status from Google Safe Browsing',
      'VirusTotal check timeout increased from 5s to 15s to reduce false negatives',
    ],
  },
  {
    date: '2026-04-05',
    version: 'v3.5.0',
    type: 'Feature',
    title: 'Monitoring & Score Alerts',
    items: [
      'Set up automated weekly or daily audits per site',
      'Score drop email alerts — configure threshold (e.g. alert if score drops >10 points)',
      'Critical issue instant notifications — SSL expiry, malware detection',
    ],
  },
];

const typeColor: Record<string, string> = {
  Feature: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Improvement: 'text-green-400 bg-green-500/10 border-green-500/20',
  Fix: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Security: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Changelog</div>
          <h1 className="text-5xl font-bold text-white mb-4">What&apos;s new</h1>
          <p className="text-slate-400 text-lg">Every feature, improvement, and fix — shipped fast, documented clearly.</p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="relative pl-8 border-l border-slate-800">
          {ENTRIES.map((e, i) => (
            <div key={`${e.version}-${i}`} className="mb-12 relative">
              <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${e.type === 'Feature' ? 'bg-blue-500' : e.type === 'Improvement' ? 'bg-green-500' : 'bg-orange-500'}`} />
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <time className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                <code className="text-xs font-mono text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded">{e.version}</code>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColor[e.type]}`}>{e.type}</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-3">{e.title}</h2>
              <ul className="space-y-2">
                {e.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <span className="text-slate-600 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
