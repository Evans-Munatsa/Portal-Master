import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Get candidate's current readiness interview results
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interview = await db.videoInterview.findFirst({
      where: { candidate_id: session.userId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ interview });
  } catch (error) {
    console.error('Error fetching video interview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Evaluate and store candidate's answers
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers, videoBase64 } = await req.json();

    // Fetch user details for richer manual review context
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        professional_title: true,
        experience_level: true,
        resume_text: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Default structure for the standard interview questions, ready for Superadmin manual review
    const baseQuestions = [
      {
        id: 1,
        title: 'Value Proposition & Background',
        transcript: 'Video recorded. Awaiting manual transcription by Super Admin.',
        questionScore: 0,
        points: ['Pending manual evaluation']
      },
      {
        id: 2,
        title: 'Technical Execution & Resilience',
        transcript: 'Video recorded. Awaiting manual transcription by Super Admin.',
        questionScore: 0,
        points: ['Pending manual evaluation']
      },
      {
        id: 3,
        title: 'Adversity & Collaborative Leadership',
        transcript: 'Video recorded. Awaiting manual transcription by Super Admin.',
        questionScore: 0,
        points: ['Pending manual evaluation']
      },
      {
        id: 4,
        title: 'Career Trajectory & Growth Mindset',
        transcript: 'Video recorded. Awaiting manual transcription by Super Admin.',
        questionScore: 0,
        points: ['Pending manual evaluation']
      }
    ];

    // Store in database as PENDING_REVIEW with 0 score
    const createdInterview = await db.videoInterview.create({
      data: {
        candidate_id: session.userId,
        video_url: videoBase64 || '', // store a base64 recording clip or visual context
        questions: JSON.stringify(baseQuestions),
        score: 0,
        feedback: 'Your recorded video interview is pending manual review and scoring by a Super Admin.',
        status: 'PENDING_REVIEW'
      }
    });

    return NextResponse.json({ success: true, interview: createdInterview });
  } catch (error) {
    console.error('Error generating readiness evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
