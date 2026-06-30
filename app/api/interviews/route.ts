import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { dispatchInterviewInvitation } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'CLIENT' && session.role !== 'EMPLOYER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { application_id, candidate_id, proposed_time, notes } = await req.json();

    const interview = await db.interview.create({
      data: {
        application_id,
        employer_id: session.userId,
        candidate_id,
        proposed_time: new Date(proposed_time),
        notes,
        status: 'Proposed'
      }
    });

    // Also update application status to Interviewing if it's not already
    await db.jobApplication.update({
      where: { id: application_id },
      data: { status: 'Interviewing' }
    });

    // Fetch candidate and job info to send real communications
    const jobApp = await db.jobApplication.findUnique({
      where: { id: application_id },
      include: {
        candidate: true,
        job: true
      }
    });

    if (jobApp) {
      const candidate = jobApp.candidate;
      const job = jobApp.job;

      const candidateName = candidate?.name || 'Talent';
      const candidateEmail = candidate?.email;
      const candidatePhone = candidate?.phone;
      const jobTitle = job?.title || 'Job Role';
      const companyName = job?.company || 'Employer Partner';

      const formattedTime = new Date(proposed_time).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // 1. Create in-app inbox notification
      await db.notification.create({
        data: {
          user_id: candidate_id,
          title: `Interview Invitation: ${jobTitle}`,
          content: `${companyName} has invited you to an interview for "${jobTitle}". Time: ${formattedTime}. Notes/Instructions: ${notes || 'None'}. Please view this under settings or confirm below.`,
          type: 'INTERVIEW'
        }
      });

      // 2. Dispatch external multi-channel notifications (Email, SMS, WhatsApp)
      if (candidateEmail) {
        await dispatchInterviewInvitation({
          candidateEmail,
          candidatePhone,
          candidateName,
          jobTitle,
          companyName,
          proposedTime: new Date(proposed_time),
          notes
        });
      }
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
