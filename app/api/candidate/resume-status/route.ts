import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CANDIDATE') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await db.resumeTask.findMany({
      where: { candidate_id: session.userId },
      orderBy: { created_at: 'desc' },
      take: 1
    });

    return NextResponse.json({ task: tasks[0] || null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
