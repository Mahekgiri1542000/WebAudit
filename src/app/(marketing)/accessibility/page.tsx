import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accessibility — WebAudit',
  description: 'WebAudit\'s commitment to accessibility and our WCAG 2.1 AA compliance status.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Accessibility</div>
          <h1 className="text-4xl font-bold text-white mb-3">Accessibility Statement</h1>
          <p className="text-slate-500 text-sm">Last reviewed: June 2026</p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Our commitment</h2>
            <p className="text-slate-400 text-sm leading-relaxed">WebAudit is committed to ensuring our platform is accessible to all users, regardless of disability or assistive technology. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Current conformance status</h2>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-white font-semibold">Partially conformant — WCAG 2.1 AA</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">We have addressed most WCAG 2.1 AA criteria. Some areas of the dashboard are still being improved, particularly around complex data tables and chart accessibility.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Known limitations</h2>
            <ul className="space-y-2.5">
              {[
                'Score history charts: currently rendered as canvas elements without alternative text descriptions. We are adding data table alternatives.',
                'PDF reports: exported PDFs are not fully screen-reader accessible. We are investigating tagged PDF generation.',
                'Complex data tables: some audit result tables require improvement to header associations.',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="text-yellow-400 mt-0.5 shrink-0">⚠</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What we have implemented</h2>
            <ul className="space-y-2.5">
              {[
                'Semantic HTML5 document structure',
                'ARIA labels on all interactive elements',
                'Keyboard navigation support throughout the dashboard',
                'Focus indicators on all interactive elements',
                'Sufficient colour contrast ratios (minimum 4.5:1 for normal text)',
                'Skip navigation links on all pages',
                'Form inputs with associated labels',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Feedback and contact</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              If you experience an accessibility barrier on WebAudit, please contact us. We aim to respond within 5 business days with a resolution or workaround.
            </p>
            <a href="mailto:accessibility@webaudit.app" className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-700 hover:border-blue-500/40 text-slate-300 font-semibold rounded-xl transition text-sm">
              Email accessibility@webaudit.app →
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
