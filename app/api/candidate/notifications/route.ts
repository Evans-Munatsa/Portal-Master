import { withErrorHandler } from '@/lib/apiMiddleware';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

async function getNotificationsHandler(req: Request, context: any, session: any) {
  const notifications = await db.notification.findMany({
    where: {
      user_id: session.userId,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return NextResponse.json({ notifications });
}

async function markNotificationReadHandler(req: Request, context: any, session: any) {
  const { notificationId, markAll } = await req.json();

  if (markAll) {
    await db.notification.updateMany({
      where: {
        user_id: session.userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  }

  await db.notification.update({
    where: {
      id: notificationId,
      user_id: session.userId,
    },
    data: {
      is_read: true,
    },
  });

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandler(getNotificationsHandler, ['CANDIDATE']);
export const POST = withErrorHandler(markNotificationReadHandler, ['CANDIDATE']);
