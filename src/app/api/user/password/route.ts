import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { current, newPassword } = await req.json();
    if (!current || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: 'Password change is not available for OAuth accounts.' }, { status: 400 });
    }

    const valid = await bcrypt.compare(current, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[user/password PATCH]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
