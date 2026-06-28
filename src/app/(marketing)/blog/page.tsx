import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — WebAudit',
  description: 'SEO tips, GEO & AI search insights, Core Web Vitals guides, and product updates from the WebAudit team.',
  openGraph: { title: 'WebAudit Blog', description: 'Actionable SEO and AI visibility content from the WebAudit team.' },
};

const POSTS = [
  {
    slug: 'geo-optimisation-guide-2026',
    category: 'GEO',
    tag: 'Guide',
    title: 'The Complete Guide to GEO: Ranking in ChatGPT, Perplexity & Google AIO in 2026',
    excerpt: 'Generative Engine Optimisation is no longer optional. Learn the 10 signals that determine whether your content gets cited in AI-generated answers.',
    date: '2026-06-20',
    readTime: '12 min read',
    featured: true,
  },
  {
    slug: 'core-web-vitals-2026',
    category: 'PageSpeed',
    tag: 'Technical',
    title: 'Core Web Vitals 2026: LCP, CLS & TBT — What Actually Moved Rankings This Year',
    excerpt: 'A data-driven look at which CWV thresholds correlated with ranking changes across 50,000 audited URLs in 2026.',
    date: '2026-06-14',
    readTime: '8 min read',
    featured: false,
  },
  {
    slug: 'llms-txt-explained',
    category: 'GEO',
    tag: 'Explainer',
    title: 'What Is llms.txt and Does Your Site Need One?',
    excerpt: 'The new convention for helping AI crawlers understand your site structure — and whether it actually improves your GEO score.',
    date: '2026-06-07',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'hreflang-common-mistakes',
    category: 'International SEO',
    tag: 'Guide',
    title: '12 hreflang Mistakes That Kill International Rankings (and How to Fix Them)',
    excerpt: 'Missing return tags, incorrect locale codes, and mixed HTTP/HTTPS — the hreflang errors we see most often in enterprise audits.',
    date: '2026-06-01',
    readTime: '9 min read',
    featured: false,
  },
  {
    slug: 'security-headers-seo-impact',
    category: 'Security',
    tag: 'Technical',
    title: 'Do Security Headers Affect Your Google Rankings? The Evidence in 2026',
    excerpt: 'HSTS, CSP, X-Frame-Options — we tested whether missing security headers have a measurable SEO impact on 10,000 sites.',
    date: '2026-05-24',
    readTime: '7 min read',
    featured: false,
  },
  {
    slug: 'schema-markup-ai-citations',
    category: 'Structured Data',
    tag: 'Guide',
    title: 'Schema Markup for AI Citations: FAQ, HowTo, and Article Schema Explained',
    excerpt: 'How to implement schema that helps AI search engines cite your content directly in generated answers.',
    date: '2026-05-17',
    readTime: '10 min read',
    featured: false,
  },
];

const CATEGORIES = ['All', 'GEO', 'PageSpeed', 'International SEO', 'Security', 'Structured Data', 'Product'];

const tagColor: Record<string, string> = {
  Guide: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Technical: 'text-green-400 bg-green-500/10 border-green-500/20',
  Explainer: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Blog</div>
          <h1 className="text-5xl font-bold text-white mb-4">SEO & AI Insights</h1>
          <p className="text-slate-400 text-lg">Actionable guides on SEO, GEO, PageSpeed, and the future of search — from the WebAudit team.</p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${c === 'All' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED POST */}
      {featured && (
        <section className="max-w-6xl mx-auto px-6 py-8">
          <Link href={`/blog/${featured.slug}`} className="group block p-8 rounded-3xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/70 transition">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{featured.category}</span>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${tagColor[featured.tag]}`}>{featured.tag}</span>
              <span className="text-slate-600 text-xs">Featured</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-blue-400 transition mb-3">{featured.title}</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-5 max-w-3xl">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-slate-600 text-sm">
              <span>{new Date(featured.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>·</span>
              <span>{featured.readTime}</span>
            </div>
          </Link>
        </section>
      )}

      {/* POST GRID */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(p => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/70 transition flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{p.category}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${tagColor[p.tag] ?? 'text-slate-400 bg-slate-800 border-slate-700'}`}>{p.tag}</span>
              </div>
              <h3 className="text-white font-bold group-hover:text-blue-400 transition leading-snug mb-3 flex-1">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{p.excerpt}</p>
              <div className="flex items-center gap-3 text-slate-600 text-xs">
                <span>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>{p.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="p-8 rounded-3xl border border-slate-800/60 bg-slate-900/40">
          <h2 className="text-2xl font-bold text-white mb-2">Get the latest SEO & GEO insights</h2>
          <p className="text-slate-400 text-sm mb-6">Weekly digest — no spam. Unsubscribe any time.</p>
          <div className="flex gap-3">
            <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
            <button className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm whitespace-nowrap">Subscribe →</button>
          </div>
        </div>
      </section>
    </div>
  );
}
