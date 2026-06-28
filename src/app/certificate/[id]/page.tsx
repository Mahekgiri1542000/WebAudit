import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getScoreLabel, getScoreColor } from '@/types/audit';

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await db.audit.findUnique({
    where: { certificateId: id },
    select: {
      url: true, overallScore: true, onPageScore: true, geoScore: true,
      aeoScore: true, securityScore: true, pageSpeedScore: true,
      verificationHash: true, certificateId: true, completedAt: true, createdAt: true,
    },
  });

  if (!audit) notFound();

  const score = audit.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="p-8 bg-slate-900 border border-slate-700 rounded-2xl text-center shadow-2xl">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-6">Website Audit Certificate</p>

          <p className="text-white font-bold text-xl mb-1 break-all">{audit.url}</p>
          <p className="text-slate-500 text-sm mb-8">
            Audited {audit.completedAt ? new Date(audit.completedAt).toLocaleDateString() : new Date(audit.createdAt).toLocaleDateString()}
          </p>

          <div className="mb-8">
            <p className={`text-8xl font-black ${getScoreColor(score)}`}>{score}</p>
            <p className="text-slate-400 mt-2">{getScoreLabel(score)}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'SEO', value: audit.onPageScore },
              { label: 'AI Ready', value: audit.geoScore },
              { label: 'AEO', value: audit.aeoScore },
              { label: 'Security', value: audit.securityScore },
              { label: 'PageSpeed', value: audit.pageSpeedScore },
            ].filter(s => s.value !== null).map((s) => (
              <div key={s.label} className="p-3 bg-slate-800 rounded-lg">
                <p className={`text-xl font-bold ${getScoreColor(s.value!)}`}>{s.value}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-xs font-mono break-all">
            Verification: {audit.verificationHash?.slice(0, 16)}...
          </p>
          <p className="text-slate-700 text-xs mt-1">Certificate ID: {audit.certificateId}</p>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-slate-500 text-xs">Issued by WebAudit · webaudit.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
