import { checkRole } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { withErrorHandler } from '@/lib/apiMiddleware';

async function settingsHandler(req: Request, context: any, session: any) {
  const { email, currentPassword, newPassword } = await req.json();

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const updateData: any = {};

  if (email && email !== user.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    updateData.email = email;
  }

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 });
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    updateData.password = hashPassword(newPassword);
  }

  if (Object.keys(updateData).length > 0) {
    await db.user.update({
      where: { id: session.userId },
      data: updateData
    });
  }

  return NextResponse.json({ success: true });
}

export const PUT = withErrorHandler(settingsHandler, ['CANDIDATE']);
