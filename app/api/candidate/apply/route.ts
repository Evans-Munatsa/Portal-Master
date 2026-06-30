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

  const job = await db.job.findUnique({
    where: { id: jobId }
  });

  const jobTitle = job?.title || 'Job Post';
  const companyName = job?.company || 'Employer';

  // Create inbox acknowledgement notification
  await db.notification.create({
    data: {
      user_id: session.userId,
      title: `Application Acknowledgment: ${jobTitle}`,
      content: `Hi there! This is a confirmation that your job application for "${jobTitle}" at ${companyName} has been successfully submitted. We will keep you updated if the employer decides to invite you to an interview. Good luck!`,
      type: 'APPLICATION'
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
