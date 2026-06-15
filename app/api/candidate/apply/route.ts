import { checkRole } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/apiMiddleware';

async function applyHandler(req: Request, context: any, session: any) {
  const { jobId } = await req.json();

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  // Ensure it doesn't already exist to avoid unique constraint violations
  const existing = await db.jobApplication.findUnique({
    where: {
      candidate_id_job_id: {
        candidate_id: session.userId,
        job_id: jobId
      }
    }
  });

  if (existing) {
    return NextResponse.json({ error: 'Already applied' }, { status: 400 });
  }

  const application = await db.jobApplication.create({
    data: {
      candidate_id: session.userId,
      job_id: jobId
    }
  });

  return NextResponse.json({ success: true, application });
}

async function cancelApplyHandler(req: Request, context: any, session: any) {
  const { jobId } = await req.json();

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  const existing = await db.jobApplication.findUnique({
    where: {
      candidate_id_job_id: {
        candidate_id: session.userId,
        job_id: jobId
      }
    }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  await db.jobApplication.delete({
    where: {
      id: existing.id
    }
  });

  return NextResponse.json({ success: true });
}

export const POST = withErrorHandler(applyHandler, ['CANDIDATE']);
export const DELETE = withErrorHandler(cancelApplyHandler, ['CANDIDATE']);
