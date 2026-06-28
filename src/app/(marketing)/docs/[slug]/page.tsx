import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ')} — WebAudit Docs`,
    description: `WebAudit documentation: ${slug.replace(/-/g, ' ')}`,
  };
}

export default async function DocSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/docs" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition mb-8">
          ← Back to docs
        </Link>
        <div className="p-8 rounded-3xl border border-slate-800/60 bg-slate-900/40 text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-white mb-3 capitalize">{slug.replace(/-/g, ' ')}</h1>
          <p className="text-slate-400 mb-6">This documentation page is being written. Full API docs are coming soon.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/docs" className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition text-sm">
              Browse all docs
            </Link>
            <Link href="/contact" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm">
              Ask support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
