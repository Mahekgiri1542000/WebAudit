import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// Simple in-memory store placeholder — swap for a DB model when ready
// This keeps the UI functional without requiring schema changes
const apiKeyStore: Map<string, { id: string; userId: string; name: string; prefix: string; hash: string; createdAt: string; lastUsed: string | null }[]> = new Map();

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keys = (apiKeyStore.get(session.user.id) ?? []).map(({ hash: _hash, ...rest }) => rest);
  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    const raw = `wa_${crypto.randomBytes(24).toString('hex')}`;
    const prefix = raw.slice(0, 10);
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const id = crypto.randomUUID();

    const record = { id, userId: session.user.id, name: name.trim(), prefix, hash, createdAt: new Date().toISOString(), lastUsed: null };
    const existing = apiKeyStore.get(session.user.id) ?? [];
    apiKeyStore.set(session.user.id, [...existing, record]);

    const { hash: _h, ...safeRecord } = record;
    return NextResponse.json({ key: raw, record: safeRecord }, { status: 201 });
  } catch (err) {
    console.error('[api-keys POST]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
