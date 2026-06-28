'use client';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('password');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(next);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleEmailContinue} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f07b29] focus:ring-1 focus:ring-[#f07b29] text-sm"
            required
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-semibold rounded-lg transition text-sm"
          >
            Continue with Email
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-600 flex-1 truncate">{email}</span>
            <button type="button" onClick={() => { setStep('email'); setError(''); }} className="text-[#f07b29] text-xs font-medium shrink-0">
              Change
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f07b29] focus:ring-1 focus:ring-[#f07b29] text-sm"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-semibold rounded-lg transition disabled:opacity-60 text-sm"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      )}

      <p className="text-center text-gray-500 text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#f07b29] hover:text-[#e06a18] font-medium">
          Sign up free
        </Link>
      </p>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="underline">Terms & Conditions</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">Privacy Policy</Link>
      </p>
    </div>
  );
}

const PREVIEW_SLIDES = [
  {
    stat1: { label: 'Total Audits Run', value: '47K+' },
    stat2: { label: 'Avg Score Improvement', value: '+28pts' },
    title: 'Track your SEO health for free.',
    desc: 'See scores, critical issues, and AI-powered fixes for your entire site in one dashboard.',
  },
  {
    stat1: { label: 'Checks Per Audit', value: '60+' },
    stat2: { label: 'Accuracy Rate', value: '98%' },
    title: 'Deeper insights than any free tool.',
    desc: 'GEO, AEO, PageSpeed, Security, Off-Page — everything in 60 seconds.',
  },
  {
    stat1: { label: 'Sites Monitored', value: '3.2K' },
    stat2: { label: 'Alerts Sent', value: '18K+' },
    title: 'Never miss a ranking drop.',
    desc: 'Schedule automatic audits and get alerted the moment something changes.',
  },
];

export default function LoginPage() {
  const [slide, setSlide] = useState(0);

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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to WebAudit</h1>
          <p className="text-gray-500 text-sm mb-8">
            Get website analytics, SEO audits, and AI-powered insights for free.{' '}
            <Link href="/features" className="text-[#f07b29] hover:underline">Learn more →</Link>
          </p>

          <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse" />}>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} WebAudit. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right: dark preview panel ── */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] flex-col justify-between p-10 bg-[#1a1f6e] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f07b29]/10 rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -translate-x-24 translate-y-24" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-xs font-medium mb-12">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live platform data
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
              <p className="text-white/50 text-xs mb-1">{PREVIEW_SLIDES[slide].stat1.label}</p>
              <p className="text-white text-4xl font-bold">{PREVIEW_SLIDES[slide].stat1.value}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
              <p className="text-white/50 text-xs mb-1">{PREVIEW_SLIDES[slide].stat2.label}</p>
              <p className="text-[#f07b29] text-4xl font-bold">{PREVIEW_SLIDES[slide].stat2.value}</p>
            </div>
          </div>

          {/* Mini score card preview */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-8">
            <p className="text-white/50 text-xs mb-3">Example Audit — example.com</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'SEO', score: 87, color: 'text-green-400' },
                { label: 'Speed', score: 72, color: 'text-yellow-400' },
                { label: 'Security', score: 94, color: 'text-green-400' },
                { label: 'GEO/AI', score: 61, color: 'text-yellow-400' },
              ].map((s) => (
                <div key={s.label} className="text-center bg-white/5 rounded-xl p-2.5">
                  <p className={`text-xl font-bold ${s.color}`}>{s.score}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-white text-xl font-bold mb-2">{PREVIEW_SLIDES[slide].title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{PREVIEW_SLIDES[slide].desc}</p>
        </div>

        {/* Slide dots */}
        <div className="relative z-10 flex items-center gap-2 mt-8">
          {PREVIEW_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${i === slide ? 'w-8 bg-[#f07b29]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
