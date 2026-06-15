import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withErrorHandler } from '@/lib/apiMiddleware';

async function handler(req: Request, context: any, session: any) {
  const { jobId } = await req.json();

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  const existing = await db.savedJob.findUnique({
    where: {
      candidate_id_job_id: { candidate_id: session.userId, job_id: jobId }
    }
  });

  if (existing) {
    await db.savedJob.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, saved: false });
  } else {
    await db.savedJob.create({
      data: { candidate_id: session.userId, job_id: jobId }
    });
    return NextResponse.json({ success: true, saved: true });
  }
}

export const POST = withErrorHandler(handler, ['CANDIDATE']);
