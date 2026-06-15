import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { scoreMatch } from '@/lib/gemini';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CANDIDATE') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('resume') as File | null;
    if (!file) return NextResponse.json({ error: 'No resume provided' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    await db.user.update({
      where: { id: session.userId },
      data: { resume_text: text },
    });

    const jobs = await db.job.findMany({ 
      where: { status: 'ACTIVE' },
      select: { id: true, description: true, title: true } 
    });
    
    // Create task
    const task = await db.resumeTask.create({
      data: { candidate_id: session.userId, status: 'PROCESSING', progress: 0 }
    });

    // process in background
    processResumeTask(session.userId, text, jobs, task.id);

    return NextResponse.json({ success: true, taskId: task.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function processResumeTask(userId: number, text: string, jobs: any[], taskId: number) {
  try {
    await db.jobMatch.deleteMany({ where: { candidate_id: userId } });
    let completed = 0;
    
    for (const job of jobs) {
       try {
          const matchResult = await scoreMatch(text, job.description);
          await db.jobMatch.create({
            data: {
              candidate_id: userId,
              job_id: job.id,
              match_score: matchResult.matchScore || 0,
              missing_skills: JSON.stringify(matchResult.missingSkills || []),
              matched_skills: JSON.stringify(matchResult.matchedSkills || []),
              recommendation: matchResult.recommendation || 'Unsuitable',
              fit_summary: matchResult.fitSummary || 'No summary available.',
            }
          });
       } catch (err) {
          console.error('Match failed for job', job.id, err);
       }
       completed++;
       const progress = Math.min(99, Math.round((completed / jobs.length) * 100));
       await db.resumeTask.update({ where: { id: taskId }, data: { progress } });
    }

    await db.resumeTask.update({ where: { id: taskId }, data: { progress: 100, status: 'COMPLETED' } });
  } catch (err) {
    console.error('Task failed', err);
    await db.resumeTask.update({ where: { id: taskId }, data: { status: 'FAILED' } });
  }
}
