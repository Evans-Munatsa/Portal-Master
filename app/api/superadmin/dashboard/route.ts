import { checkRole } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = await checkRole(['SUPERADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 1. All Candidates
    const candidates = await db.user.findMany({
      where: { role: 'CANDIDATE' },
      select: {
        id: true,
        name: true,
        email: true,
        professional_title: true,
        experience_level: true,
        resume_text: true,
        linkedin_url: true,
        github_url: true,
        video_interviews: {
          select: {
            id: true,
            video_url: true,
            questions: true,
            score: true,
            feedback: true,
            status: true,
            created_at: true,
          }
        },
        job_matches: {
          select: {
            id: true,
            match_score: true,
            missing_skills: true,
            matched_skills: true,
            recommendation: true,
            fit_summary: true,
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              }
            }
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            applied_at: true,
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              }
            }
          }
        },
        resume_tasks: {
          select: {
            id: true,
            status: true,
            progress: true,
            updated_at: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // 2. All Employers
    const employers = await db.user.findMany({
      where: { role: { in: ['EMPLOYER', 'CLIENT'] } },
      select: {
        id: true,
        name: true,
        email: true,
        tenant_id: true,
        jobs_posted: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            description: true,
            salary_min: true,
            salary_max: true,
            status: true,
            years_experience: true,
            mandatory_skills: true,
            tech_stack: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // 3. All Jobs for the Dedicated Jobs Tab
    const jobs = await db.job.findMany({
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // 4. All Job Matches
    const matches = await db.jobMatch.findMany({
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true, company: true } }
      },
      orderBy: { match_score: 'desc' }
    });

    // 5. All Job Applications for Success Rates
    const applications = await db.jobApplication.findMany({
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true, company: true } }
      },
      orderBy: { applied_at: 'desc' }
    });

    // 6. All Initiated Interviews & Parties
    const interviews = await db.interview.findMany({
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        employer: { select: { id: true, name: true, email: true } },
        application: {
          include: {
            job: { select: { id: true, title: true, company: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const totalApps = applications.length;
    const successfulApps = applications.filter((app) => 
      ['Interviewing', 'Offered'].includes(app.status)
    ).length;
    const successRate = totalApps > 0 
      ? Math.round((successfulApps / totalApps) * 100) 
      : 0;

    return NextResponse.json({
      user: { role: 'SUPERADMIN', name: 'System Administrator' },
      candidates,
      employers,
      jobs,
      matches,
      applications,
      interviews,
      stats: {
        totalCandidates: candidates.length,
        totalEmployers: employers.length,
        totalJobs: jobs.length,
        totalMatches: matches.length,
        totalApplications: totalApps,
        totalInterviews: interviews.length,
        successRate,
        averageMatchScore: matches.length > 0 
          ? Math.round(matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length) 
          : 0
      }
    });
  } catch (error) {
    console.error('Superadmin Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
