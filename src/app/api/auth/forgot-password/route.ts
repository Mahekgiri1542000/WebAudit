import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/notifications/send-email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return 200 — don't reveal whether the email exists
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: expires },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? '';
    sendVerificationEmail(user.email, token, baseUrl).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
