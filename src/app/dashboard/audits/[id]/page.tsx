import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { getScoreLabel, getScoreColor } from '@/types/audit';
import type { AuditReport, Suggestion } from '@/types/audit';
import Link from 'next/link';
import AuditWaiting from '@/components/dashboard/AuditWaiting';
import CopyShareLink from '@/components/dashboard/CopyShareLink';
import ExportMenu from '@/components/dashboard/ExportMenu';
import { getUserPlanTier } from '@/lib/billing/usage';

function ScoreCard({ label, score }: { label: string; score: number | null }) {
  if (score === null) return null;
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
      <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
      <p className="text-slate-400 text-xs mt-1">{label}</p>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const priorityColors = {
    critical: 'border-red-500/50 bg-red-500/5',
    high: 'border-orange-500/50 bg-orange-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    low: 'border-slate-700',
  };
  const effortBadge = {
    'quick-win': '⚡ Quick Win',
    'moderate': '⏱ Moderate',
    'major': '🔨 Major',
  };

  return (
    <div className={`p-4 rounded-xl border ${priorityColors[suggestion.priority]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-400 uppercase">{suggestion.category}</span>
            <span className="text-xs text-slate-500">{effortBadge[suggestion.effortLevel]}</span>
            {suggestion.aiGenerated && <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">🤖 AI</span>}
          </div>
          <p className="text-white font-medium text-sm">{suggestion.title}</p>
          <p className="text-slate-400 text-xs mt-1">{suggestion.description}</p>
          {suggestion.currentValue && (
            <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
              <span className="text-red-400">Now: </span><span className="text-slate-300">{suggestion.currentValue}</span>
              {suggestion.targetValue && (
                <><br /><span className="text-green-400">Goal: </span><span className="text-slate-300">{suggestion.targetValue}</span></>
              )}
            </div>
          )}
          {suggestion.readyToUseCode && (
            <details className="mt-2">
              <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">View ready-to-use code</summary>
              <pre className="mt-2 p-2 bg-slate-950 rounded text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                {suggestion.readyToUseCode}
              </pre>
            </details>
          )}
        </div>
        <div className="shrink-0">
          <span className={`text-xs font-bold uppercase ${suggestion.priority === 'critical' ? 'text-red-400' : suggestion.priority === 'high' ? 'text-orange-400' : suggestion.priority === 'medium' ? 'text-yellow-400' : 'text-slate-500'}`}>
            {suggestion.priority}
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function AuditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const audit = await db.audit.findUnique({ where: { id } });
  if (!audit) notFound();
  if (audit.userId !== session.user.id && session.user.role === 'CUSTOMER') notFound();

  const report = audit.report as unknown as AuditReport | null;
  const suggestions = (audit.suggestions as unknown as Suggestion[] | null) ?? [];
  const planTier = await getUserPlanTier(session.user.id);

  if (audit.status === 'PENDING' || audit.status === 'RUNNING') {
    return <AuditWaiting auditId={audit.id} url={audit.url} />;
  }

  if (audit.status === 'FAILED') {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Audit failed</p>
          <p className="text-slate-500 text-sm">{audit.errorMessage}</p>
          <Link href="/dashboard/audits/new" className="mt-4 inline-block text-blue-400 text-sm">Try again →</Link>
        </div>
      </div>
    );
  }

  const quickWins = suggestions.filter((s) => s.effortLevel === 'quick-win');
  const otherSuggestions = suggestions.filter((s) => s.effortLevel !== 'quick-win');

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back + URL + Export */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/dashboard" className="text-slate-500 text-sm hover:text-slate-300">← Dashboard</Link>
            <h1 className="text-white font-bold text-xl mt-2 truncate">{audit.url}</h1>
            <p className="text-slate-500 text-xs mt-1">
              {audit.detectedCms && <span className="text-blue-400 mr-2">{audit.detectedCms}</span>}
              Audited {new Date(audit.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="shrink-0">
            <ExportMenu auditId={audit.id} auditUrl={audit.url} planTier={planTier} />
          </div>
        </div>

        {/* Overall score */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-6 flex items-center gap-6">
          <div className="text-center">
            <p className={`text-6xl font-bold ${getScoreColor(audit.overallScore ?? 0)}`}>{audit.overallScore}</p>
            <p className="text-slate-400 text-sm mt-1">Overall Score</p>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{getScoreLabel(audit.overallScore ?? 0)}</p>
            {report?.confidence && (
              <p className="text-slate-500 text-xs mt-1">Confidence: {report.confidence.confidenceScore}%</p>
            )}
            <div className="flex gap-3 mt-3">
              {audit.certificateId && (
                <Link href={`/certificate/${audit.certificateId}`} className="text-xs text-blue-400 hover:text-blue-300">
                  📜 View Certificate
                </Link>
              )}
              {audit.shareToken && (
                <CopyShareLink shareToken={audit.shareToken} />
              )}
            </div>
          </div>
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <ScoreCard label="On-Page SEO" score={audit.onPageScore} />
          <ScoreCard label="Off-Page SEO" score={audit.offPageScore} />
          <ScoreCard label="GEO (AI)" score={audit.geoScore} />
          <ScoreCard label="AEO" score={audit.aeoScore} />
          <ScoreCard label="Worldwide" score={audit.worldwideSeoScore} />
          <ScoreCard label="PageSpeed" score={audit.pageSpeedScore} />
          <ScoreCard label="Security" score={audit.securityScore} />
        </div>

        {/* Suggestions — Fix These First */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">
            ⚡ Fix These First
            {suggestions.length > 0 && <span className="text-slate-500 font-normal text-sm ml-2">({suggestions.length} suggestions)</span>}
          </h2>

          {audit.aiSuggestionsStatus === 'running' && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-sm mb-4">
              🤖 AI is generating personalized suggestions with ready-to-use code...
            </div>
          )}

          {suggestions.length === 0 && (
            <p className="text-slate-500 text-sm">No suggestions available yet.</p>
          )}

          {/* Quick wins first */}
          {quickWins.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">⚡ Quick Wins (do these first)</p>
              <div className="space-y-3">
                {quickWins.map((s) => <SuggestionCard key={s.id} suggestion={s} />)}
              </div>
            </div>
          )}

          {otherSuggestions.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">More improvements</p>
              <div className="space-y-3">
                {otherSuggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} />)}
              </div>
            </div>
          )}
        </div>

        {/* GEO Critical Blockers */}
        {report?.geo?.criticalBlockers && report.geo.criticalBlockers.length > 0 && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h3 className="text-red-400 font-semibold mb-2">🚨 Critical GEO Blockers</h3>
            <ul className="space-y-1">
              {report.geo.criticalBlockers.map((blocker, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">×</span> {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
