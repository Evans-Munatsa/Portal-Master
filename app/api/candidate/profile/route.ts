import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { scoreMatch } from '@/lib/gemini';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, professional_title, experience_level, resume_text, linkedin_url, github_url, phone } = await req.json();

    // Get old user details to see if resume text is changing
    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { resume_text: true }
    });

    const isResumeTextChanging = resume_text !== undefined && resume_text !== currentUser?.resume_text;

    // Update user record
    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(professional_title !== undefined && { professional_title }),
        ...(experience_level !== undefined && { experience_level }),
        ...(resume_text !== undefined && { resume_text }),
        ...(linkedin_url !== undefined && { linkedin_url }),
        ...(github_url !== undefined && { github_url }),
        ...(phone !== undefined && { phone }),
      },
    });

    let taskId = null;

    // If resume text is changed, recheck jobs matching
    if (isResumeTextChanging && resume_text && resume_text.trim().length > 0) {
      const jobs = await db.job.findMany({ 
        where: { status: 'ACTIVE' },
        select: { id: true, description: true, title: true } 
      });
      
      // Create a background resume processing task
      const task = await db.resumeTask.create({
        data: { candidate_id: session.userId, status: 'PROCESSING', progress: 0 }
      });
      taskId = task.id;

      // process in background
      processResumeTaskInProfile(session.userId, resume_text, jobs, task.id);
    }

    return NextResponse.json({ success: true, user: updatedUser, taskId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function processResumeTaskInProfile(userId: number, text: string, jobs: any[], taskId: number) {
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
