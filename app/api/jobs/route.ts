import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'CLIENT' && session.role !== 'EMPLOYER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      title, 
      company, 
      location, 
      description,
      years_experience,
      mandatory_skills,
      tech_stack,
      salary_min,
      salary_max
    } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Sanitize the employer's rich text using sanitize-html to prevent XSS attacks
    const sanitizedDescription = sanitizeHtml(description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2']),
      allowedAttributes: false, // Or restrict strictly if preferrred
    });

    // Parse skills and tools cleanly
    const parseStringArray = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        return val.map(s => String(s).trim()).filter(Boolean);
      }
      if (typeof val === 'string') {
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    };

    const yearsExp = years_experience ? String(years_experience).trim() : null;
    const mandatorySkillsArr = parseStringArray(mandatory_skills);
    const techStackArr = parseStringArray(tech_stack);

    const salaryMinVal = salary_min && !isNaN(parseInt(String(salary_min), 10)) ? parseInt(String(salary_min), 10) : null;
    const salaryMaxVal = salary_max && !isNaN(parseInt(String(salary_max), 10)) ? parseInt(String(salary_max), 10) : null;

    const job = await db.job.create({
      data: {
        title,
        company: company || 'My Company',
        location: location || 'Remote',
        description: sanitizedDescription,
        employer_id: session.userId,
        years_experience: yearsExp,
        mandatory_skills: mandatorySkillsArr,
        tech_stack: techStackArr,
        salary_min: salaryMinVal,
        salary_max: salaryMaxVal
      }
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Job Creation Error:', error);
    // We send a generic error rather than the stack trace
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'CLIENT' && session.role !== 'EMPLOYER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id: Number(id) }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Security check: ensure this employer owns this job
    if (job.employer_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden. You do not own this job post.' }, { status: 403 });
    }

    await db.job.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Job Deletion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
