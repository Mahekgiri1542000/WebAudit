'use client';
import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AuditGlobe = dynamic(() => import('./AuditGlobe').then((m) => ({ default: m.AuditGlobe })), {
  ssr: false,
  loading: () => null,
});

const DISABLE_THREE_JS = process.env.NEXT_PUBLIC_DISABLE_THREE_JS === 'true';

export function HeroBanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { inputRef.current?.focus(); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (res.status === 401) {
        router.push(`/register?next=/dashboard/audits/new&url=${encodeURIComponent(url)}`);
        return;
      }
      const data = await res.json();
      if (data.auditId) {
        router.push(`/dashboard/audits/${data.auditId}`);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020817]">
      {/* Three.js background canvas */}
      {!DISABLE_THREE_JS && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AuditGlobe />
        </div>
      )}

      {/* Static gradient fallback for reduced-motion users */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-[#020817] to-cyan-900/10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full mb-6 uppercase tracking-widest">
            AI-Powered Website Auditing
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          Audit Any Website
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            in 60 Seconds
          </span>
        </motion.h1>

        <motion.p
          className="text-slate-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          SEO · PageSpeed · Security · GEO (AI Search) · AEO (Voice &amp; Snippets) · Worldwide Rankings
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Starting...' : 'Run Free Audit →'}
          </button>
        </motion.form>

        <motion.p
          className="text-slate-600 text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Free — no credit card required · 3 audits/month on free plan
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-8 mt-12 text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <span>✓ SEO Score</span>
          <span>✓ AI Visibility (GEO)</span>
          <span>✓ PageSpeed (Core Web Vitals)</span>
          <span>✓ Security Audit</span>
        </motion.div>
      </div>
    </section>
  );
}
