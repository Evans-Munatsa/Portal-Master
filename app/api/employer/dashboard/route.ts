import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'CLIENT' && session.role !== 'EMPLOYER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { 
        id: true,
        name: true, 
        role: true, 
        tenant_id: true,
        tenant: true 
      }
    });

    const myJobs = await db.job.findMany({
      where: { employer_id: session.userId },
      orderBy: { id: 'desc' }
    });

    const applications = await db.jobApplication.findMany({
      where: { job: { employer_id: session.userId } },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            professional_title: true,
            experience_level: true,
            resume_text: true,
            phone: true,
            linkedin_url: true,
            github_url: true,
            video_interviews: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        },
        job: { select: { title: true } },
        interviews: true
      },
      orderBy: { applied_at: 'desc' }
    });

    // Also get the match scores for these applicants for their applied jobs!
    const applicationMatches = await Promise.all(
      applications.map(async (app) => {
        const matchInfo = await db.jobMatch.findUnique({
          where: {
            candidate_id_job_id: {
              candidate_id: app.candidate_id,
              job_id: app.job_id
            }
          }
        });
        return {
          ...app,
          matchContext: matchInfo
        };
      })
    );

    if (user) {
      (user as any).realRole = session.realRole;
    }

    return NextResponse.json({
      user,
      jobs: myJobs,
      applications: applicationMatches
    });
  } catch (error) {
    console.error('Employer Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
