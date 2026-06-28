import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getScoreLabel, getScoreColor } from '@/types/audit';
import type { AuditReport, Suggestion } from '@/types/audit';
import Link from 'next/link';

export default async function ShareReportPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;

  const audit = await db.audit.findUnique({
    where: { shareToken },
    select: {
      url: true, overallScore: true, onPageScore: true, offPageScore: true,
      geoScore: true, aeoScore: true, worldwideSeoScore: true, pageSpeedScore: true,
      securityScore: true, detectedCms: true, completedAt: true, createdAt: true,
      report: true, suggestions: true, certificateId: true,
    },
  });

  if (!audit) notFound();

  const report = audit.report as unknown as AuditReport | null;
  const suggestions = (audit.suggestions as unknown as Suggestion[] | null) ?? [];
  const quickWins = suggestions.filter((s) => s.effortLevel === 'quick-win').slice(0, 5);

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-4">Shared Audit Report</p>
          <h1 className="text-white font-bold text-2xl break-all mb-2">{audit.url}</h1>
          {audit.detectedCms && <p className="text-blue-400 text-sm">{audit.detectedCms}</p>}
          <p className="text-slate-500 text-xs mt-1">
            {audit.completedAt ? new Date(audit.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </p>
        </div>

        {/* Overall Score */}
        <div className="text-center mb-10 p-8 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className={`text-8xl font-black ${getScoreColor(audit.overallScore ?? 0)}`}>
            {audit.overallScore}
          </p>
          <p className="text-white text-lg font-semibold mt-2">{getScoreLabel(audit.overallScore ?? 0)}</p>
          {report?.confidence && (
            <p className="text-slate-500 text-sm mt-1">Confidence Score: {report.confidence.confidenceScore}%</p>
          )}
          {audit.certificateId && (
            <Link href={`/certificate/${audit.certificateId}`} className="inline-block mt-4 text-xs text-blue-400 hover:text-blue-300">
              📜 View Verification Certificate →
            </Link>
          )}
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          {[
            { label: 'On-Page SEO', score: audit.onPageScore },
            { label: 'Off-Page', score: audit.offPageScore },
            { label: 'GEO/AI', score: audit.geoScore },
            { label: 'AEO', score: audit.aeoScore },
            { label: 'Worldwide', score: audit.worldwideSeoScore },
            { label: 'PageSpeed', score: audit.pageSpeedScore },
            { label: 'Security', score: audit.securityScore },
          ].filter((s) => s.score !== null).map((s) => (
            <div key={s.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className={`text-3xl font-bold ${getScoreColor(s.score!)}`}>{s.score}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4">⚡ Top Quick Wins</h2>
            <div className="space-y-3">
              {quickWins.map((s) => (
                <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold shrink-0 mt-0.5 ${s.priority === 'critical' ? 'bg-red-500/10 text-red-400' : s.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {s.priority}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{s.title}</p>
                      <p className="text-slate-400 text-xs mt-1">{s.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GEO Blockers */}
        {report?.geo?.criticalBlockers && report.geo.criticalBlockers.length > 0 && (
          <div className="mb-10 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h3 className="text-red-400 font-semibold mb-2">🚨 AI Search Blockers</h3>
            <ul className="space-y-1">
              {report.geo.criticalBlockers.map((b, i) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-red-400">×</span> {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
          <p className="text-white font-bold text-lg mb-2">Get a full audit for your site</p>
          <p className="text-slate-400 text-sm mb-6">SEO · GEO · AEO · PageSpeed · Security — all in one report</p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
          >
            Start Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
