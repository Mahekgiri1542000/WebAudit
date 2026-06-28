'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-800 mb-4 select-none">500</div>
        <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
        {error.digest && (
          <p className="text-slate-600 text-xs font-mono mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={reset} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
            Try again
          </button>
          <Link href="/" className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
