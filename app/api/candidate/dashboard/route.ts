import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        professional_title: true,
        experience_level: true,
        resume_text: true,
        linkedin_url: true,
        github_url: true,
        role: true,
      }
    });
    
    let matches: any[] = [];
    let savedJobs: any[] = [];
    let applications: any[] = [];
    let allJobs: any[] = [];
    let readinessInterview: any = null;
    
    if (session.role === 'CANDIDATE') {
      readinessInterview = await db.videoInterview.findFirst({
        where: { candidate_id: session.userId },
        orderBy: { created_at: 'desc' }
      });

      const rawMatches = await db.jobMatch.findMany({
        where: { 
          candidate_id: session.userId,
          job: { status: 'ACTIVE' }
        },
        include: {
          job: true
        },
        orderBy: { match_score: 'desc' }
      });

      matches = rawMatches.map(m => ({
        ...m,
        title: m.job.title,
        company: m.job.company,
        location: m.job.location,
        description: m.job.description,
        job_description: m.job.description,
        salary_min: m.job.salary_min,
        salary_max: m.job.salary_max,
        years_experience: m.job.years_experience,
        mandatory_skills_db: m.job.mandatory_skills,
        tech_stack_db: m.job.tech_stack,
        missing_skills: JSON.parse(m.missing_skills || '[]'),
        matched_skills: JSON.parse(m.matched_skills || '[]')
      }));

      const rawSaved = await db.savedJob.findMany({
        where: { candidate_id: session.userId }
      });
      savedJobs = rawSaved.map(s => s.job_id);

      const rawApplications = await db.jobApplication.findMany({
        where: { candidate_id: session.userId },
        include: {
          job: true,
          interviews: true
        },
        orderBy: { applied_at: 'desc' }
      });
      applications = rawApplications.map(a => ({
        id: a.id,
        status: a.status,
        applied_at: a.applied_at.toISOString(),
        job: {
          id: a.job.id,
          title: a.job.title,
          company: a.job.company,
          location: a.job.location,
        },
        interviews: a.interviews
      }));

      // Fetch all active jobs from all employers
      const rawAllJobs = await db.job.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'desc' }
      });

      allJobs = rawAllJobs.map(j => {
        const existingMatch = matches.find((m: any) => m.job_id === j.id);
        if (existingMatch) {
          return {
            ...existingMatch,
            id: `all_${j.id}`,
            job_id: j.id,
          };
        } else {
          // Fallback fit summary or description excerpt
          const cleanDesc = j.description ? j.description.replace(/<[^>]*>/g, '') : '';
          const snippet = cleanDesc.length > 150 ? cleanDesc.substring(0, 150) + '...' : cleanDesc;
          return {
            id: `all_${j.id}`,
            job_id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description,
            job_description: j.description,
            salary_min: j.salary_min,
            salary_max: j.salary_max,
            match_score: 0, // No specific match score exists
            fit_summary: snippet || 'No detailed analysis summary available.',
            years_experience: j.years_experience,
            mandatory_skills_db: j.mandatory_skills || [],
            tech_stack_db: j.tech_stack || [],
            missing_skills: j.mandatory_skills || [],
            matched_skills: []
          };
        }
      });
    }

    if (user) {
      (user as any).realRole = session.realRole;
    }

    return NextResponse.json({ user, matches, savedJobs, applications, allJobs, readinessInterview });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
