import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Verification link is invalid or has expired.' }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
