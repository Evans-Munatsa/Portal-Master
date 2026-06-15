import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

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

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
