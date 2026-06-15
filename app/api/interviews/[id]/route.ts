import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const interviewId = parseInt(params.id);
    const { status, proposed_time } = await req.json();

    const data: any = {};
    if (status) data.status = status;
    if (proposed_time) data.proposed_time = new Date(proposed_time);

    const interview = await db.interview.update({
      where: { id: interviewId },
      data
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
