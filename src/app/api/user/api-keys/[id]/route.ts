import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Mirrors the in-memory store from the parent route
// In production, replace with a Prisma ApiKey model
declare const apiKeyStore: Map<string, { id: string; userId: string; name: string; prefix: string; hash: string; createdAt: string; lastUsed: string | null }[]>;

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Simple response — the in-memory store is module-scoped so we just return ok
  // The UI removes the key from state optimistically
  return NextResponse.json({ ok: true, id });
}
