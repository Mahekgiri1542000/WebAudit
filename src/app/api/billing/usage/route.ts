import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsageSummary } from '@/lib/billing/usage';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const summary = await getUsageSummary(session.user.id);
  return NextResponse.json(summary);
}
