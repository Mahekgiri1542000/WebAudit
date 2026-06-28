import Link from 'next/link';
import Image from 'next/image';

const FEATURES = [
  { icon: '🔍', title: 'On-Page SEO', desc: 'Title tags, meta, H1s, canonical, Open Graph, image alt text, word count, internal links — 20+ checks.' },
  { icon: '🤖', title: 'GEO — AI Visibility', desc: 'GPTBot/ClaudeBot crawlability, E-E-A-T signals, entity recognition, llms.txt, AI citation readiness.' },
  { icon: '💬', title: 'AEO — Answer Engine', desc: 'FAQ & HowTo schema, featured snippet optimization, PAA alignment, voice search signals.' },
  { icon: '⚡', title: 'PageSpeed & Core Web Vitals', desc: 'LCP, CLS, TBT, FCP — mobile and desktop — powered by Google PageSpeed Insights API.' },
  { icon: '🔒', title: 'Security & SSL', desc: 'HTTPS, HSTS, CSP, X-Frame-Options, malware scan via Google Safe Browsing + VirusTotal.' },
  { icon: '🌍', title: 'Worldwide SEO', desc: 'hreflang, html[lang], LocalBusiness schema, NAP consistency, international URL structure.' },
];

const TESTIMONIALS = [
  {
    quote: "Went from a score of 42 to 81 in 3 weeks. The AI suggestions told me exactly what to fix and even gave me the code.",
    name: 'Sarah Chen',
    role: 'Founder, Bloom Agency',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
  },
  {
    quote: "We monitor 40+ client sites. The automated alerts catch issues before our clients even notice. Huge time saver.",
    name: 'Marcus Rivera',
    role: 'Head of SEO, ScaleUp Digital',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
  },
  {
    quote: "The GEO score was eye-opening. We had no idea how invisible we were to AI search until this tool flagged 11 blockers.",
    name: 'Priya Nair',
    role: 'Marketing Director, TechFlow',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
  },
];

const LOGOS = ['Shopify', 'WordPress', 'Next.js', 'Webflow', 'HubSpot', 'Wix', 'Squarespace', 'GHL'];

export default function LandingPage() {
  return (
    <main className="bg-[#020817] overflow-hidden">

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">

        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] animate-glow" style={{ animationDelay: '1s' }} />

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Hexagon outline top-left */}
          <div className="absolute top-24 left-12 w-20 h-20 border border-blue-500/20 rotate-12 animate-float-up" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          {/* Square top-right */}
          <div className="absolute top-32 right-20 w-12 h-12 border border-cyan-400/25 rotate-45 animate-float-down" />
          {/* Triangle mid-left */}
          <div className="absolute top-1/2 left-8 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-blue-400/30 animate-drift" style={{ animationDelay: '3s' }} />
          {/* Circle dots */}
          <div className="absolute top-40 right-40 w-3 h-3 rounded-full bg-blue-400/40 animate-float-up" style={{ animationDelay: '1s' }} />
          <div className="absolute top-60 left-1/3 w-2 h-2 rounded-full bg-cyan-400/50 animate-float-down" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-40 right-1/4 w-4 h-4 rounded-full border border-violet-400/30 animate-float-up" style={{ animationDelay: '2s' }} />
          {/* Rotating ring */}
          <div className="absolute top-20 right-1/4 w-32 h-32 border border-dashed border-blue-500/10 rounded-full animate-spin-slow" />
          <div className="absolute bottom-32 left-1/4 w-24 h-24 border border-dashed border-cyan-400/10 rounded-full animate-spin-slow-rev" />
          {/* Small squares scattered */}
          <div className="absolute bottom-48 right-16 w-8 h-8 border border-blue-400/20 animate-drift" style={{ animationDelay: '4s' }} />
          <div className="absolute top-1/3 right-12 w-6 h-6 bg-blue-600/10 rotate-12 animate-float-down" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Website Auditing — Free to Start
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Audit Any Website
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
              in 60 Seconds
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            SEO · PageSpeed · Security · GEO (AI Search) · AEO (Voice & Snippets) · Worldwide Rankings.<br className="hidden sm:block" />
            One audit. Full picture.
          </p>

          {/* Hero CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40"
            >
              Get Started Free →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-lg transition border border-white/10 hover:border-white/20"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-slate-600 text-sm">No credit card required · 3 free audits/month</p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-slate-500 text-sm">
            {['✓ 7 audit categories', '✓ 40+ checks', '✓ AI suggestions with code', '✓ Share results'].map((b) => (
              <span key={b} className="text-slate-400">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM LOGOS ──────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-800/60 bg-slate-900/30 overflow-hidden">
        <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-8">Works with every platform</p>
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} className="text-slate-500 font-semibold text-lg tracking-tight shrink-0">{logo}</span>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '47,000+', label: 'Audits run' },
            { value: '3,200+', label: 'Sites monitored' },
            { value: '280K+', label: 'Issues caught' },
            { value: '+23 pts', label: 'Avg score lift' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-white mb-2">{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT SCREENSHOT ──────────────────────────────────── */}
      <section className="py-10 px-6 max-w-6xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/50">
          {/* Browser chrome mockup */}
          <div className="bg-[#0d1526] border-b border-slate-700/60 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 bg-slate-800/60 rounded-md h-6 flex items-center px-3">
              <span className="text-slate-500 text-xs">app.webaudit.io/dashboard</span>
            </div>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80"
            alt="WebAudit Dashboard"
            width={1200}
            height={600}
            className="w-full object-cover opacity-80"
            unoptimized
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/80 via-transparent to-transparent" />
          {/* Score badges floating over screenshot */}
          <div className="absolute bottom-6 left-6 flex gap-3">
            {[
              { label: 'SEO', score: 87, color: 'text-green-400' },
              { label: 'PageSpeed', score: 76, color: 'text-yellow-400' },
              { label: 'Security', score: 94, color: 'text-green-400' },
              { label: 'GEO', score: 61, color: 'text-orange-400' },
            ].map((b) => (
              <div key={b.label} className="bg-[#0d1526]/90 backdrop-blur border border-slate-700/60 rounded-xl px-4 py-2 text-center">
                <p className={`text-2xl font-bold ${b.color}`}>{b.score}</p>
                <p className="text-slate-400 text-xs">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">Everything in one audit</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Most tools check one thing. WebAudit runs 40+ checks across 7 categories simultaneously.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-[#0d1526] border border-slate-800/70 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xl mb-4 group-hover:bg-blue-600/20 transition">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Up and running in seconds</h2>
          <p className="text-slate-400 mb-16">Three steps — no setup, no integrations required.</p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste your URL', desc: 'Enter any website URL — yours, a competitor\'s, or a client\'s site.' },
              { step: '02', title: 'We scan everything', desc: '40+ automated checks across SEO, performance, security, and AI visibility.' },
              { step: '03', title: 'Get your report + fixes', desc: 'Prioritized action items with ready-to-use code snippets and AI explanations.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-14">Loved by 1,200+ businesses</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="p-6 bg-[#0d1526] border border-slate-800/70 rounded-2xl flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                <Image
                  src={t.img}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING TEASER ──────────────────────────────────────── */}
      <section className="py-10 px-6 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { name: 'Free', price: '$0', audits: '3 audits/mo', color: 'border-slate-700' },
            { name: 'Starter', price: '$19', audits: '30 audits/mo', color: 'border-blue-500 ring-1 ring-blue-500/30', badge: 'Most Popular' },
            { name: 'Pro', price: '$49', audits: '150 audits/mo', color: 'border-slate-700' },
          ].map((p) => (
            <div key={p.name} className={`relative p-6 rounded-2xl bg-[#0d1526] border ${p.color}`}>
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-full">{p.badge}</span>
              )}
              <h3 className="text-white font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-3xl font-bold text-white mb-1">{p.price}<span className="text-slate-500 text-sm font-normal">/mo</span></p>
              <p className="text-slate-400 text-sm mb-4">{p.audits}</p>
              <Link href="/pricing" className="block text-center py-2.5 rounded-xl border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-white text-sm font-medium transition">
                View details →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-blue-600/8 rounded-full blur-[80px] animate-glow" />

        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Start auditing for free today
          </h2>
          <p className="text-slate-400 text-lg mb-8">No credit card. No setup. Just results.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition shadow-2xl shadow-blue-600/30"
            >
              Get Started Free →
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-lg transition border border-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
