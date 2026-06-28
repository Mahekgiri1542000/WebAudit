import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Case Studies — WebAudit',
  description: 'How teams across eCommerce, SaaS, agencies, and publishing use WebAudit to improve rankings and AI search visibility.',
  openGraph: { title: 'WebAudit Case Studies', description: 'Real results from teams using WebAudit.' },
};

const STUDIES = [
  {
    id: 'ecommerce',
    logo: '🛒',
    company: 'Retool Commerce',
    industry: 'eCommerce',
    challenge: 'Lost 38% of organic traffic following a Core Web Vitals update. LCP was averaging 4.2s across product pages.',
    solution: 'WebAudit identified 1,200 product pages with render-blocking third-party scripts and missing `fetchpriority` on hero images.',
    results: [
      { label: 'LCP improved', value: '4.2s → 1.7s' },
      { label: 'Organic traffic', value: '+52% in 90 days' },
      { label: 'Revenue from organic', value: '+$340K/mo' },
    ],
    quote: 'WebAudit found the exact pages hurting us. The per-page score history made it easy to track our engineering progress week over week.',
    author: 'Sarah J., Head of SEO',
  },
  {
    id: 'saas',
    logo: '💻',
    company: 'CloudStack HQ',
    industry: 'SaaS',
    challenge: 'Competitors started appearing in ChatGPT and Perplexity answers. Their brand was invisible in AI-generated responses despite strong traditional rankings.',
    solution: 'GEO audit revealed missing llms.txt, blocked GPTBot in robots.txt, and zero FAQ schema across 400 pages.',
    results: [
      { label: 'GEO score', value: '28 → 81' },
      { label: 'AI search citations', value: 'Tracked via Perplexity monitoring' },
      { label: 'Time to fix', value: '2 sprints' },
    ],
    quote: 'We didn\'t know we were invisible to AI. The GEO score turned something abstract into a concrete engineering task.',
    author: 'Marcus L., VP Engineering',
  },
  {
    id: 'agency',
    logo: '🏪',
    company: 'Apex Digital Agency',
    industry: 'SEO Agency',
    challenge: 'Spending 6 hours per client per month manually compiling technical audit reports across 30 client sites.',
    solution: 'Switched to WebAudit Agency plan — automated weekly scans, white-label PDF reports, and the REST API feeding their internal dashboard.',
    results: [
      { label: 'Audit time per client', value: '6 hours → 15 minutes' },
      { label: 'Sites managed', value: '30 → 80' },
      { label: 'Monthly cost saved', value: '$8,200 in staff hours' },
    ],
    quote: 'The white-label reports look better than anything we were producing manually. Clients actually read them now.',
    author: 'Priya M., Founder',
  },
  {
    id: 'publisher',
    logo: '📰',
    company: 'The Digest Media',
    industry: 'Publishing',
    challenge: 'High-quality journalism that never ranked due to missing structured data and security header issues flagging Google\'s crawl budget.',
    solution: 'WebAudit\'s security + structured data audit identified 14 critical issues including mixed content, missing Article schema, and an expired SSL on a subdomain.',
    results: [
      { label: 'Security score', value: '31 → 94' },
      { label: 'Crawl coverage', value: '+29% pages indexed' },
      { label: 'Top 10 rankings', value: '+128 keywords' },
    ],
    quote: 'The SSL expiry on our archive subdomain was silently tanking our crawl budget for months. One audit caught it immediately.',
    author: 'David K., Technical Editor',
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Case Studies</div>
          <h1 className="text-5xl font-bold text-white mb-4">Real results, real teams</h1>
          <p className="text-slate-400 text-xl">How organisations across eCommerce, SaaS, agencies, and publishing improved rankings and AI visibility with WebAudit.</p>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-5">
          {[
            { val: '10,000+', label: 'Teams using WebAudit' },
            { val: '+47%', label: 'Average traffic uplift' },
            { val: '4.9/5', label: 'Customer satisfaction' },
          ].map(s => (
            <div key={s.label} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
              <div className="text-3xl font-black text-white">{s.val}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {STUDIES.map((s, i) => (
          <div key={s.id} id={s.id} className="p-8 rounded-3xl border border-slate-800/60 bg-slate-900/40 scroll-mt-24">
            <div className="flex items-start gap-5 mb-6">
              <div className="text-4xl">{s.logo}</div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.industry}</div>
                <h2 className="text-2xl font-bold text-white">{s.company}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Challenge</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{s.challenge}</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Solution</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{s.solution}</p>
                </div>
              </div>
              <div className="space-y-3">
                {s.results.map(r => (
                  <div key={r.label} className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
                    <div className="text-xs text-slate-500 mb-1">{r.label}</div>
                    <div className="text-white font-bold text-lg">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <blockquote className="border-l-2 border-blue-500 pl-5">
              <p className="text-slate-300 italic mb-2">&ldquo;{s.quote}&rdquo;</p>
              <cite className="text-slate-500 text-sm not-italic">— {s.author}</cite>
            </blockquote>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Start your own success story</h2>
        <p className="text-slate-400 text-lg mb-8">Run your first audit free — see exactly what to fix in 60 seconds.</p>
        <Link href="/register" className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xl shadow-blue-600/20 text-lg">
          Get started free →
        </Link>
      </section>
    </div>
  );
}
