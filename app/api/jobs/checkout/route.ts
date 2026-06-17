import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import { PayfastService } from '@/services/integrations/payfast.service';

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

    const sanitizedDescription = sanitizeHtml(description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2']),
      allowedAttributes: false,
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

    // Create the job directly as ACTIVE instead of PENDING_PAYMENT to bypass payment
    const job = await db.job.create({
      data: {
        title,
        company: company || 'My Company',
        location: location || 'Remote',
        description: sanitizedDescription,
        employer_id: session.userId,
        status: 'ACTIVE',
        years_experience: yearsExp,
        mandatory_skills: mandatorySkillsArr,
        tech_stack: techStackArr,
        salary_min: salaryMinVal,
        salary_max: salaryMaxVal
      }
    });

    return NextResponse.json({ success: true, bypassed: true, payfast: null });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
