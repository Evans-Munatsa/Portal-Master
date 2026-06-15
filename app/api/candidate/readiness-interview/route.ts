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

    // Fetch user details for richer Gemini evaluation context
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

    const prompt = `
      You are an expert executive coach and senior recruiting evaluator. 
      You are assessing a candidate's timed job readiness oral interview.
      
      Candidate Profile:
      - Name: ${user.name || 'N/A'}
      - Target Title: ${user.professional_title || 'N/A'}
      - Experience level: ${user.experience_level || 'N/A'}
      - Resume/Skills context: ${user.resume_text || 'N/A'}

      Interview details:
      The candidate was recorded answering 4 questions.
      User answers summary or prompt keywords provided:
      ${JSON.stringify(answers)}

      Based on their profile and responses, evaluate their oral job readiness:
      1. Calculate an overall readiness score from 0 to 100.
      2. Provide a 3-paragraph executive coaching summary with core strengths and actionable development ideas.
      3. Generate a realistic and professional spoken response transcript (approx 100-150 words) for each answered question, reflecting what a high-caliber professional with their background would say to fully hit the criteria.
      4. Give bulleted concise coaching points and a score for each individual question response.

      Return the result strictly as a JSON object matching the requested schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Overall recruitment readiness score out of 100."
            },
            feedback: {
              type: Type.STRING,
              description: "Detailed 2-3 paragraph coaching and performance evaluation feedback text."
            },
            questionsResponse: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  transcript: { type: Type.STRING, description: "A realistic oral response transcript spoken professionally by the candidate." },
                  questionScore: { type: Type.INTEGER },
                  points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Coaching feedback bullets for this specific question response." }
                },
                required: ["id", "title", "transcript", "questionScore", "points"]
              }
            }
          },
          required: ["score", "feedback", "questionsResponse"]
        }
      }
    });

    const parsedEvaluations = JSON.parse(response.text || '{}');

    // Store in database
    const createdInterview = await db.videoInterview.create({
      data: {
        candidate_id: session.userId,
        video_url: videoBase64 || '', // store a base64 recording clip or visual context
        questions: JSON.stringify(parsedEvaluations.questionsResponse),
        score: parsedEvaluations.score || 75,
        feedback: parsedEvaluations.feedback || '',
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({ success: true, interview: createdInterview });
  } catch (error) {
    console.error('Error generating readiness evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
