'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

const FEATURES = [
  { icon: '🔍', title: '60+ SEO Checks', desc: 'On-page, technical, structured data' },
  { icon: '🤖', title: 'AI Visibility Score', desc: 'GEO & AEO for ChatGPT, Perplexity' },
  { icon: '⚡', title: 'PageSpeed Analysis', desc: 'Core Web Vitals & mobile score' },
  { icon: '🔒', title: 'Security Audit', desc: 'SSL, malware, blacklist checks' },
  { icon: '📈', title: 'Keyword Tracking', desc: 'Monitor rankings automatically' },
  { icon: '📊', title: 'Export Reports', desc: 'CSV, Word, JSON, PDF formats' },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Registration failed');
        setLoading(false);
        return;
      }

      await signIn('credentials', { email, password, redirect: false });
      router.push('/onboarding');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: white form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white min-h-screen">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#f07b29] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">WebAudit</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a free account</h1>
          <p className="text-gray-500 text-sm mb-8">
            No credit card required. 3 free audits per month.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f07b29] focus:ring-1 focus:ring-[#f07b29] text-sm"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f07b29] focus:ring-1 focus:ring-[#f07b29] text-sm"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f07b29] focus:ring-1 focus:ring-[#f07b29] text-sm"
              required
              minLength={8}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-semibold rounded-lg transition disabled:opacity-60 text-sm"
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#f07b29] hover:text-[#e06a18] font-medium">
              Log in
            </Link>
          </p>

          <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline">Terms & Conditions</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>

          <p className="mt-8 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} WebAudit. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right: dark features panel ── */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] flex-col justify-center p-12 bg-[#1a1f6e] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f07b29]/10 rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -translate-x-24 translate-y-24" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-xs font-medium mb-10">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            Free forever plan available
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">
            Everything you need to dominate search
          </h2>
          <p className="text-white/60 text-sm mb-10">
            Used by 12,000+ marketers, developers, and SEO professionals.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <span className="text-2xl mb-2 block">{f.icon}</span>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-white/50 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#f07b29', '#4285F4', '#34A853', '#EA4335'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1f6e]" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-white/60 text-xs">
              Join <span className="text-white font-semibold">12,000+</span> users already tracking their SEO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
