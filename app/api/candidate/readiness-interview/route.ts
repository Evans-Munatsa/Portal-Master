import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { GoogleGenAI, Type } from '@google/genai';
import Mux from '@mux/mux-node';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

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

    const { answers, videoBase64, muxUploadId } = await req.json();

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

    // Resolve final video URL/playback ID
    let finalVideoUrl = videoBase64 || '';

    if (muxUploadId) {
      if (muxUploadId.startsWith('mock_upload_')) {
        // Mock Mux Upload - generate a simulated mock playback ID
        const mockPlaybackId = `mock_playback_${Math.random().toString(36).substring(2)}`;
        finalVideoUrl = `mux://${mockPlaybackId}`;
      } else if (MUX_TOKEN_ID && MUX_TOKEN_SECRET) {
        // Real Mux Upload - try resolving Playback ID
        try {
          const mux = new Mux({
            tokenId: MUX_TOKEN_ID,
            tokenSecret: MUX_TOKEN_SECRET,
          });
          const uploadInfo = await mux.video.uploads.retrieve(muxUploadId);
          if (uploadInfo && uploadInfo.asset_id) {
            const assetInfo = await mux.video.assets.retrieve(uploadInfo.asset_id);
            if (assetInfo && assetInfo.playback_ids && assetInfo.playback_ids.length > 0) {
              const playbackId = assetInfo.playback_ids[0].id;
              finalVideoUrl = `mux://${playbackId}`;
            }
          }
        } catch (muxError: any) {
          console.error('[MUX ERROR] Error resolving Mux upload ID:', muxError);
        }
      }
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
        video_url: finalVideoUrl, 
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
