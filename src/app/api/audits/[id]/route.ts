import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const audit = await db.audit.findUnique({ where: { id } });

  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only owner or admin can view
  if (audit.userId !== session.user.id && session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(audit);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const audit = await db.audit.findUnique({ where: { id } });

  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (audit.userId !== session.user.id && session.user.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.audit.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
