'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Check your email for the correct link.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async res => {
        if (res.ok) {
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 2500);
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(data.error ?? 'Verification link is invalid or has expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token, router]);

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="text-white font-bold mb-2">Verifying your email…</h2>
        <p className="text-slate-400 text-sm">This only takes a moment.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
        <h2 className="text-white font-bold mb-2">Email verified!</h2>
        <p className="text-slate-400 text-sm">Your email has been confirmed. Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
      <h2 className="text-white font-bold mb-2">Verification failed</h2>
      <p className="text-slate-400 text-sm mb-5">{message}</p>
      <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
        Go to sign in →
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white font-bold text-base">WebAudit</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Email Verification</h1>
        </div>
        <div className="p-7 rounded-2xl border border-slate-800/60 bg-slate-900/40">
          <Suspense fallback={<div className="text-slate-400 text-sm text-center">Loading…</div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
