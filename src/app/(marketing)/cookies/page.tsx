import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy — WebAudit',
  description: 'Information about the cookies WebAudit uses and how to manage them.',
};

const COOKIES = [
  { name: 'session', type: 'Strictly Necessary', duration: 'Session', purpose: 'Maintains your authenticated session. Required for the platform to function.' },
  { name: 'next-auth.csrf-token', type: 'Strictly Necessary', duration: 'Session', purpose: 'CSRF protection token for form submissions.' },
  { name: 'next-auth.session-token', type: 'Strictly Necessary', duration: '30 days', purpose: 'Encrypted session token for remembered sign-in.' },
  { name: '_wa_analytics', type: 'Analytics', duration: '1 year', purpose: 'First-party analytics — tracks page views and feature usage to help us improve the product. No personal data sent to third parties.' },
  { name: 'wa_preferences', type: 'Functional', duration: '1 year', purpose: 'Stores your UI preferences (theme, dashboard layout, notification settings).' },
];

const typeColor: Record<string, string> = {
  'Strictly Necessary': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Analytics': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Functional': 'text-green-400 bg-green-500/10 border-green-500/20',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Legal</div>
          <h1 className="text-4xl font-bold text-white mb-3">Cookie Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: 1 June 2026</p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">What are cookies?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">Cookies are small text files placed on your device when you visit a website. They allow the site to remember your actions and preferences over a period of time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">What cookies does WebAudit use?</h2>
            <p className="text-slate-400 text-sm mb-5">We use only the cookies listed below. We do not use third-party advertising or tracking cookies.</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60">
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold">Cookie</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold">Type</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold">Duration</th>
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c, i) => (
                    <tr key={c.name} className={`border-b border-slate-800/60 ${i % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColor[c.type]}`}>{c.type}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{c.duration}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">How to manage cookies</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              Strictly necessary cookies cannot be disabled as they are required for the platform to function. You can disable analytics and functional cookies in your browser settings.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Most browsers allow you to view, manage, and delete cookies through their settings. Note that disabling cookies may impair your experience of WebAudit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Questions about our cookie use? Email <a href="mailto:privacy@webaudit.app" className="text-blue-400 hover:text-blue-300">privacy@webaudit.app</a> or see our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
