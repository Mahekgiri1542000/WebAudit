import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await db.audit.findUnique({
    where: { certificateId: id },
    select: {
      id: true,
      url: true,
      overallScore: true,
      onPageScore: true,
      geoScore: true,
      aeoScore: true,
      securityScore: true,
      pageSpeedScore: true,
      verificationHash: true,
      certificateId: true,
      completedAt: true,
      createdAt: true,
    },
  });

  if (!audit) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

  return NextResponse.json(audit);
}
