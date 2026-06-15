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
        jobs_posted: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            description: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // 3. All Job Matches
    const matches = await db.jobMatch.findMany({
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true, company: true } }
      },
      orderBy: { match_score: 'desc' }
    });

    // 4. All Job Applications for Success Rates
    const applications = await db.jobApplication.findMany({
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true, company: true } }
      },
      orderBy: { applied_at: 'desc' }
    });

    // 5. All Initiated Interviews & Parties
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
      matches,
      applications,
      interviews,
      stats: {
        totalCandidates: candidates.length,
        totalEmployers: employers.length,
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
