'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <span className="text-white font-bold text-base">WebAudit</span>
    </Link>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020817]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-xl shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'text-white bg-white/8' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {status === 'loading' ? (
              <div className="w-24 h-8 rounded-xl bg-slate-800/60 animate-pulse" />
            ) : session?.user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(session.user.name?.[0] ?? session.user.email?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <span className="text-slate-300 text-sm font-medium max-w-[120px] truncate">
                    {session.user.name ?? session.user.email}
                  </span>
                </div>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25">
                  Dashboard →
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25">
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a1628] border-t border-slate-800/60 shadow-2xl">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-blue-600/15 text-white border border-blue-500/20' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-2 border-t border-slate-800 flex flex-col gap-2">
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(session.user.name?.[0] ?? session.user.email?.[0] ?? 'U').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{session.user.name ?? 'Account'}</p>
                        <p className="text-slate-500 text-xs truncate">{session.user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" className="w-full text-center py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition-colors">
                      Go to Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full text-center py-2.5 text-slate-300 text-sm font-medium border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
                      Sign in
                    </Link>
                    <Link href="/register" className="w-full text-center py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition-colors">
                      Get started free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">{children}</main>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 bg-[#04080f] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Logo />
              <p className="text-slate-500 text-sm mt-4 leading-relaxed max-w-xs">
                AI-powered website auditing for SEO, GEO, PageSpeed &amp; Security. Trusted by 10,000+ teams.
              </p>
              <div className="flex gap-3 mt-5">
                {[
                  { label: 'X', href: 'https://twitter.com' },
                  { label: 'GH', href: 'https://github.com' },
                  { label: 'In', href: 'https://linkedin.com' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition text-xs font-bold">
                    {s.label}
                  </a>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-slate-600 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                All systems operational
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '/features' },
                  { label: 'Pricing', href: '/pricing' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Contact', href: '/contact' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookies' },
                  { label: 'Security', href: '/security' },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-slate-500 hover:text-slate-300 text-sm transition">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} WebAudit. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-5">
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Cookies', href: '/cookies' },
              ].map(l => (
                <Link key={l.label} href={l.href} className="text-slate-600 hover:text-slate-400 text-sm transition">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
