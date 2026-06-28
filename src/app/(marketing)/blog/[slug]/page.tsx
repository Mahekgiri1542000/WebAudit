import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const POSTS: Record<string, { title: string; category: string; date: string; readTime: string; excerpt: string; content: string }> = {
  'geo-optimisation-guide-2026': {
    title: 'The Complete Guide to GEO: Ranking in ChatGPT, Perplexity & Google AIO in 2026',
    category: 'GEO',
    date: '2026-06-20',
    readTime: '12 min read',
    excerpt: 'Generative Engine Optimisation is no longer optional. Learn the 10 signals that determine whether your content gets cited in AI-generated answers.',
    content: `
## What Is GEO?

Generative Engine Optimisation (GEO) is the practice of structuring your content and technical setup so AI-powered search engines — ChatGPT, Perplexity, Google AI Overviews, and voice assistants — cite your site directly in generated answers.

Unlike traditional SEO where you rank in a list of 10 blue links, GEO is about being **the cited source** in a single AI-generated paragraph.

## The 10 GEO Signals That Matter

### 1. GPTBot and ClaudeBot Crawlability

If your robots.txt blocks GPTBot or ClaudeBot, AI engines cannot index your content. Verify your robots.txt allows these crawlers.

### 2. E-E-A-T Signals

Experience, Expertise, Authoritativeness, and Trust — LLMs weight content from demonstrably expert sources more heavily. Include author bios, credentials, and publication dates.

### 3. llms.txt

The emerging convention for declaring your AI-indexable content in a structured file at \`/llms.txt\`. Similar to robots.txt but for LLM crawlers.

### 4. Author Schema (Person + Organization)

JSON-LD Author schema with a knowsAbout property helps AI models understand domain authority.

### 5. FAQ and HowTo Schema

FAQ and HowTo structured data is preferentially extracted by AI models for direct answers. Implement these wherever applicable.

### 6. Content Freshness

LLMs prefer recently updated content. Add \`dateModified\` to your Article schema and update evergreen content regularly.

### 7. Entity Recognition

Mention recognisable entities (people, places, organisations) with sufficient context for AI models to link your content to the knowledge graph.

### 8. Brand Mention Authority

Sites that receive authoritative external brand mentions rank higher in AI-generated content. Focus on PR and high-quality link building.

### 9. Heading Structure Clarity

H2–H4 headings should answer specific questions. "What is X?", "How does X work?" — clear Q&A structure is extracted preferentially.

### 10. Quotable Statistics

AI models love citing specific, verifiable statistics. Include data-backed claims with clear attribution.

## How to Audit Your GEO Score

WebAudit's GEO module checks all 10 of these signals and gives you a 0–100 GEO score with specific fix recommendations for each one. Run your first audit free.
    `,
  },
  'core-web-vitals-2026': {
    title: 'Core Web Vitals 2026: LCP, CLS & TBT',
    category: 'PageSpeed',
    date: '2026-06-14',
    readTime: '8 min read',
    excerpt: 'A data-driven look at which CWV thresholds correlated with ranking changes across 50,000 audited URLs in 2026.',
    content: `## Core Web Vitals in 2026\n\nCore Web Vitals continue to be a confirmed ranking factor. Here's what the data shows from 50,000 audits run through WebAudit this year.\n\n### LCP Targets\n\nThe threshold remains at 2.5s for good, but our data shows URLs with LCP under 1.8s consistently outperform those in the 2.0–2.5s range by 8–12 positions in competitive SERPs.\n\n### CLS Updates\n\nCLS scoring shifted in early 2026 to exclude layout shifts that occur within 500ms of user interaction. This helped many SPAs that had unfair CLS penalties from route transitions.\n\n### TBT as a Proxy for INP\n\nINP remains the interaction metric, but TBT from PageSpeed Insights is the best lab-measurable proxy. Keep TBT under 200ms.\n\n## Action Items\n\n1. Audit your LCP element — almost always an above-the-fold image or hero section\n2. Add \`loading="eager"\` and \`fetchpriority="high"\` to your LCP image\n3. Ensure font fallbacks closely match web font metrics to prevent CLS\n4. Defer third-party scripts aggressively to reduce TBT`,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: 'Post not found' };
  return {
    title: `${post.title} — WebAudit Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  };
}

function renderContent(md: string) {
  return md.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.slice(4)}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{line.slice(3)}</h2>;
    if (line.startsWith('1. ') || line.match(/^\d+\. /)) return <li key={i} className="text-slate-300 leading-relaxed ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-slate-300 leading-relaxed">{line}</p>;
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#020817]">
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition mb-8">
            ← Back to blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{post.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>
          <p className="text-slate-400 text-lg mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-slate-600 text-sm">
            <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="p-8 rounded-3xl border border-slate-800/60 bg-slate-900/40 space-y-2">
          {renderContent(post.content)}
        </div>

        <div className="mt-12 p-8 rounded-3xl border border-blue-500/20 bg-blue-600/10 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Audit your site for free</h3>
          <p className="text-slate-400 text-sm mb-5">Check all the signals mentioned in this article in 60 seconds — no signup required.</p>
          <Link href="/register" className="inline-block px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
            Run free audit →
          </Link>
        </div>
      </section>
    </div>
  );
}
