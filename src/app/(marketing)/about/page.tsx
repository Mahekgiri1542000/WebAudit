import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About WebAudit — Our Mission & Story',
  description: 'Learn how WebAudit is helping 10,000+ teams dominate SEO, AI search, and site performance with automated audits.',
  openGraph: { title: 'About WebAudit', description: 'Our mission, values, and the team behind the platform.' },
};

const STATS = [
  { val: '10,000+', label: 'Teams using WebAudit' },
  { val: '2.4M+', label: 'Audits completed' },
  { val: '60+', label: 'SEO & technical checks' },
  { val: '99.9%', label: 'Platform uptime' },
];

const VALUES = [
  { icon: '🎯', title: 'Accuracy First', desc: 'Every check is validated against Google\'s official guidelines and real-world ranking data. No guesswork, only actionable signals.' },
  { icon: '⚡', title: 'Speed Obsessed', desc: 'Full website audits in under 60 seconds. We believe insight should be instant, not a 48-hour wait.' },
  { icon: '🤖', title: 'AI-Native by Design', desc: 'Built for the era of generative AI — GEO, AEO, entity recognition, and AI citation signals are first-class citizens.' },
  { icon: '🌍', title: 'Globally Inclusive', desc: 'Worldwide SEO support — hreflang, international schema, and multi-language content analysis from day one.' },
  { icon: '🔒', title: 'Privacy by Default', desc: 'We analyse your site technically — we never store page content. GDPR compliant by design.' },
  { icon: '💡', title: 'Radical Transparency', desc: 'Every score is explainable. Every check shows exactly why it passed or failed, with code-level fixes included.' },
];

const TEAM = [
  { name: 'Alex Kumar', role: 'CEO & Co-founder', bio: 'Former SEO lead at a Fortune 500. Built WebAudit after getting frustrated with tools that could not keep up with AI search.' },
  { name: 'Priya Sharma', role: 'CTO & Co-founder', bio: 'Ex-Google engineer. Obsessed with performance, developer experience, and making complex data feel simple.' },
  { name: 'Marcus Lee', role: 'Head of Product', bio: '10 years in SaaS product design. Believes the best product is one that gets out of your way.' },
  { name: 'Sofia Reyes', role: 'Head of AI Research', bio: 'PhD in NLP. Leads our GEO and AEO research — making your content visible in the age of language models.' },
];

const TIMELINE = [
  { year: '2022', event: 'Founded', desc: 'WebAudit started as a side project to solve a personal frustration — no tool covered GEO and traditional SEO together.' },
  { year: '2023', event: 'Public Beta', desc: 'Launched with 500 beta users. Received 4.9/5 on Product Hunt. GEO scoring was our breakout feature.' },
  { year: '2024', event: '10K Teams', desc: 'Crossed 10,000 active teams. Launched AI-powered suggestions and the Agency plan with white-label reports.' },
  { year: '2025', event: 'AI-First Rebuild', desc: 'Rebuilt the scoring engine from scratch with Claude AI. Added AEO, voice search, and generative citation analysis.' },
  { year: '2026', event: 'Today', desc: 'Serving 10,000+ teams across 80+ countries. Building the future of website performance intelligence.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
            Our Story
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Built for the future<br />of search
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed">
            WebAudit was born from a simple belief: every website deserves world-class technical intelligence — not just for Google, but for AI search engines, voice assistants, and the next generation of discovery.
          </p>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center hover:border-blue-500/30 transition">
              <div className="text-4xl font-black text-white mb-1">{s.val}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="p-10 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-[#020817]">
          <div className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Our Mission</div>
          <p className="text-3xl font-bold text-white leading-relaxed">
            &ldquo;Make expert-level website analysis accessible to every team — from solo founders to Fortune 500 enterprises — so the best content wins, not the best-funded SEO team.&rdquo;
          </p>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">What we believe</h2>
        <p className="text-slate-400 text-center mb-12">The principles that guide every product decision we make.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map(v => (
            <div key={v.title} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70 transition">
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Our journey</h2>
        <div className="relative pl-8 border-l border-slate-800">
          {TIMELINE.map((t, i) => (
            <div key={t.year} className={`mb-10 relative ${i === TIMELINE.length - 1 ? '' : ''}`}>
              <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-blue-600 border-4 border-[#020817] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="inline-block px-2 py-0.5 text-xs font-bold text-blue-400 bg-blue-500/10 rounded mb-2">{t.year}</div>
              <h3 className="text-white font-bold text-lg">{t.event}</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Meet the team</h2>
        <p className="text-slate-400 text-center mb-12">The people who wake up every day thinking about your website&apos;s performance.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(m => (
            <div key={m.name} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center hover:border-slate-700 transition">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-2xl font-black text-white mx-auto mb-4">
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-white font-bold">{m.name}</h3>
              <div className="text-blue-400 text-xs font-semibold mt-1 mb-3">{m.role}</div>
              <p className="text-slate-500 text-xs leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to audit your site?</h2>
        <p className="text-slate-400 text-lg mb-8">Join 10,000+ teams getting better rankings with WebAudit.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xl shadow-blue-600/20 text-base">
            Get started free →
          </Link>
          <Link href="/contact" className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition text-base">
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}
