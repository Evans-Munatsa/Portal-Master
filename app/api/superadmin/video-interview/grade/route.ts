import { checkRole } from '@/lib/auth';
import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await checkRole(['SUPERADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { interviewId, score, feedback, questions } = body;

    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }

    // Verify interview exists
    const existingInterview = await db.videoInterview.findUnique({
      where: { id: parseInt(interviewId, 10) }
    });

    if (!existingInterview) {
      return NextResponse.json({ error: 'Video interview not found' }, { status: 404 });
    }

    // Prepare questions JSON
    let questionsString = '';
    if (questions) {
      questionsString = typeof questions === 'string' ? questions : JSON.stringify(questions);
    } else {
      questionsString = existingInterview.questions;
    }

    // Update interview record
    const updatedInterview = await db.videoInterview.update({
      where: { id: parseInt(interviewId, 10) },
      data: {
        score: typeof score === 'number' ? score : existingInterview.score,
        feedback: typeof feedback === 'string' ? feedback : existingInterview.feedback,
        questions: questionsString,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video interview graded and completed successfully',
      interview: updatedInterview
    });
  } catch (error: any) {
    console.error('Grade video interview error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
