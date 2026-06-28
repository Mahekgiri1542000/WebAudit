import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features — WebAudit',
  description: 'Explore every feature: 60+ SEO checks, GEO/AI visibility scoring, Core Web Vitals, security audit, site monitoring, and AI suggestions.',
  openGraph: { title: 'WebAudit Features — Complete SEO & AI Visibility Platform', description: '60+ checks across SEO, GEO, PageSpeed, Security & Worldwide rankings.' },
};

const SECTIONS = [
  {
    id: 'seo',
    icon: '🔍',
    tag: 'On-Page SEO',
    title: 'Every SEO signal that moves rankings',
    desc: 'From meta tags to schema markup — 25+ on-page checks validated against Google\'s latest ranking guidelines.',
    color: 'blue',
    checks: [
      'Meta title length & keyword presence',
      'Meta description optimization',
      'H1–H6 heading structure analysis',
      'Canonical URL validation',
      'Open Graph & Twitter Card tags',
      'Image alt text completeness',
      'Internal linking analysis',
      'Word count & content depth',
      'Keyword density & LSI signals',
      'robots.txt & noindex detection',
      'Structured data / JSON-LD validation',
      'Duplicate content signals',
    ],
  },
  {
    id: 'geo',
    icon: '🤖',
    tag: 'GEO — AI Search Visibility',
    title: 'Get discovered by AI search engines',
    desc: 'Generative Engine Optimisation — the new frontier. WebAudit scores your site\'s visibility in ChatGPT, Perplexity, Google AIO, and voice search.',
    color: 'purple',
    checks: [
      'GPTBot, ClaudeBot, PerplexityBot crawlability',
      'Google AIO eligibility signals',
      'llms.txt detection & guidance',
      'E-E-A-T signal analysis',
      'Entity recognition & knowledge graph signals',
      'AI citation readiness score',
      'Author authority & author schema',
      'FAQ & HowTo schema for AI snippets',
      'Content freshness signals',
      'Brand mention authority indicators',
    ],
  },
  {
    id: 'speed',
    icon: '⚡',
    tag: 'PageSpeed & Core Web Vitals',
    title: 'Pass the Core Web Vitals threshold',
    desc: 'Full Google PageSpeed Insights integration — mobile and desktop — with actionable recommendations for every metric.',
    color: 'yellow',
    checks: [
      'LCP (Largest Contentful Paint)',
      'CLS (Cumulative Layout Shift)',
      'TBT (Total Blocking Time)',
      'FCP (First Contentful Paint)',
      'TTFB (Time to First Byte)',
      'Mobile performance score',
      'Desktop performance score',
      'Render-blocking resources',
      'Image optimization opportunities',
      'JavaScript execution time',
    ],
  },
  {
    id: 'security',
    icon: '🔒',
    tag: 'Security Audit',
    title: 'Protect your site and your rankings',
    desc: 'SSL analysis, security header checks, malware scanning via Google Safe Browsing and VirusTotal — all in one audit.',
    color: 'green',
    checks: [
      'HTTPS enforcement check',
      'SSL certificate validity & grade (A–F)',
      'SSL expiry warning (30/7 day alerts)',
      'HSTS header enforcement',
      'Content-Security-Policy header',
      'X-Frame-Options (clickjacking)',
      'X-Content-Type-Options',
      'Referrer-Policy header',
      'Google Safe Browsing malware scan',
      'VirusTotal blacklist check',
      'Mixed content detection',
    ],
  },
  {
    id: 'monitoring',
    icon: '📊',
    tag: 'Site Monitoring',
    title: 'Never miss a ranking drop again',
    desc: 'Automated recurring audits with intelligent alerts when your score drops, a security issue appears, or a critical check fails.',
    color: 'orange',
    checks: [
      'Automated daily / weekly scans',
      'Score drop email alerts',
      'Critical issue instant notifications',
      'Historical score trending charts',
      'Diff view — what changed since last scan',
      'Keyword rank tracking integration',
      'Multiple sites per account',
      'Slack & webhook notifications (coming)',
    ],
  },
  {
    id: 'worldwide',
    icon: '🌍',
    tag: 'Worldwide SEO',
    title: 'Rank in every market and language',
    desc: 'International SEO signals — hreflang, html lang attribute, LocalBusiness schema, NAP consistency, and currency/region signals.',
    color: 'cyan',
    checks: [
      'hreflang tag detection & validation',
      'html lang attribute check',
      'LocalBusiness schema presence',
      'NAP (Name / Address / Phone) consistency',
      'International URL structure analysis',
      'Currency & region signal detection',
      'Multi-language sitemap validation',
    ],
  },
];

const color: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
            Platform Features
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Everything your site<br />needs to rank #1
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed mb-10">
            60+ checks across SEO, AI Search, PageSpeed, Security, and International rankings — all in one 60-second audit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xl shadow-blue-600/20">
              Start free audit →
            </Link>
            <Link href="/pricing" className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* SUMMARY STATS */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: '60+', label: 'Total checks' },
            { val: '< 60s', label: 'Audit speed' },
            { val: '8', label: 'Audit categories' },
            { val: 'Free', label: 'To get started' },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
              <div className="text-3xl font-black text-white">{s.val}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE SECTIONS */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <div className={`grid lg:grid-cols-2 gap-12 items-start ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border mb-4 ${color[s.color]}`}>
                  {s.icon} {s.tag}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{s.title}</h2>
                <p className="text-slate-400 leading-relaxed mb-8">{s.desc}</p>
                <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm">
                  Try it free →
                </Link>
              </div>
              <div className={`p-6 rounded-2xl border border-slate-800/60 bg-slate-900/60 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Included checks</div>
                <ul className="space-y-2.5">
                  {s.checks.map(c => (
                    <li key={c} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className={`text-xs ${color[s.color].split(' ')[0]}`}>✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* AI SUGGESTIONS */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="p-10 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-[#020817]">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border text-purple-400 bg-purple-500/10 border-purple-500/20 mb-4">
                🤖 AI Suggestions — PRO Feature
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Not just what&apos;s broken — exactly how to fix it</h2>
              <p className="text-slate-400 leading-relaxed">
                On PRO and Agency plans, Claude AI generates personalised fix suggestions with ready-to-use code, ranked by impact. No generic advice — your site, your fix, your code.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { priority: 'critical', text: 'Add missing schema markup to product pages', code: true },
                { priority: 'high', text: 'Fix 3 images missing alt attributes', code: true },
                { priority: 'medium', text: 'Enable HSTS header on your server', code: true },
              ].map(s => (
                <div key={s.text} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.priority === 'critical' ? 'bg-red-500/20 text-red-400' : s.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {s.priority}
                  </span>
                  <span className="text-sm text-white flex-1">{s.text}</span>
                  {s.code && <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">+ code</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Run your first audit free</h2>
        <p className="text-slate-400 text-lg mb-8">No credit card. Results in 60 seconds. See exactly where you stand.</p>
        <Link href="/register" className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xl shadow-blue-600/20 text-lg">
          Get started for free →
        </Link>
      </section>
    </div>
  );
}
