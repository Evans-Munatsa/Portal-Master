import { checkRole, hashPassword } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const auth = await checkRole(['SUPERADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { action, payload } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // ==========================================
    // 1. CANDIDATE CRUD
    // ==========================================
    if (action === 'CREATE_CANDIDATE') {
      const { email, password, name, professional_title, experience_level, resume_text, linkedin_url, github_url, phone } = payload;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }

      const hashedPassword = hashPassword(password);
      const newUser = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CANDIDATE',
          professional_title,
          experience_level,
          resume_text: resume_text || '',
          linkedin_url: linkedin_url || '',
          github_url: github_url || '',
          phone: phone || '',
        }
      });

      return NextResponse.json({ success: true, message: 'Candidate created successfully', user: newUser });
    }

    if (action === 'UPDATE_CANDIDATE') {
      const { id, email, password, name, professional_title, experience_level, resume_text, linkedin_url, github_url, phone } = payload;
      if (!id) {
        return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
      }

      const updateData: any = {
        email,
        name,
        professional_title,
        experience_level,
        resume_text: resume_text || '',
        linkedin_url: linkedin_url || '',
        github_url: github_url || '',
        phone: phone || '',
      };

      if (password && password.trim() !== '') {
        updateData.password = hashPassword(password);
      }

      const updatedUser = await db.user.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return NextResponse.json({ success: true, message: 'Candidate updated successfully', user: updatedUser });
    }

    if (action === 'DELETE_CANDIDATE') {
      const { candidateId } = payload;
      if (!candidateId) {
        return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
      }

      await db.user.delete({ where: { id: parseInt(candidateId) } });
      return NextResponse.json({ success: true, message: `Candidate #${candidateId} deleted.` });
    }

    // ==========================================
    // 2. EMPLOYER CRUD
    // ==========================================
    if (action === 'CREATE_EMPLOYER') {
      const { email, password, name } = payload;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
      }

      // Automatically create a tenant for the employer for separation of entities
      const cleanName = name || email.split('@')[0];
      const newTenant = await db.tenant.create({
        data: {
          name: cleanName,
          plan: 'free'
        }
      });

      const hashedPassword = hashPassword(password);
      const newUser = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name: cleanName,
          role: 'EMPLOYER',
          tenant_id: newTenant.id
        }
      });

      return NextResponse.json({ success: true, message: 'Employer created successfully', user: newUser });
    }

    if (action === 'UPDATE_EMPLOYER') {
      const { id, email, password, name } = payload;
      if (!id) {
        return NextResponse.json({ error: 'Employer ID is required' }, { status: 400 });
      }

      const updateData: any = {
        email,
        name
      };

      if (password && password.trim() !== '') {
        updateData.password = hashPassword(password);
      }

      const updatedUser = await db.user.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return NextResponse.json({ success: true, message: 'Employer updated successfully', user: updatedUser });
    }

    if (action === 'DELETE_EMPLOYER') {
      const { employerId } = payload;
      if (!employerId) {
        return NextResponse.json({ error: 'Employer ID required' }, { status: 400 });
      }

      // Check if employer user exists
      const user = await db.user.findUnique({ where: { id: parseInt(employerId) } });
      if (user && user.tenant_id) {
        // Cascade deleting through user model or delete tenant if required
        await db.user.delete({ where: { id: parseInt(employerId) } });
        try {
          await db.tenant.delete({ where: { id: user.tenant_id } });
        } catch (_) {} // ignore if failed due to links
      } else {
        await db.user.delete({ where: { id: parseInt(employerId) } });
      }

      return NextResponse.json({ success: true, message: `Employer #${employerId} deleted.` });
    }

    // ==========================================
    // 3. JOB CRUD
    // ==========================================
    if (action === 'CREATE_JOB') {
      const { title, company, location, description, salary_min, salary_max, employer_id, years_experience, mandatory_skills, tech_stack } = payload;
      if (!title || !company || !location || !description) {
        return NextResponse.json({ error: 'Title, company, location, and description are required' }, { status: 400 });
      }

      let parsedEmployerId = employer_id ? parseInt(employer_id) : null;
      let computedTenantId = null;

      if (parsedEmployerId) {
        const emp = await db.user.findUnique({ where: { id: parsedEmployerId } });
        if (emp) {
          computedTenantId = emp.tenant_id;
        }
      }

      const mandSkillsArray = Array.isArray(mandatory_skills) 
        ? mandatory_skills 
        : (mandatory_skills ? String(mandatory_skills).split(',').map(s => s.trim()).filter(Boolean) : []);
      
      const techStackArray = Array.isArray(tech_stack) 
        ? tech_stack 
        : (tech_stack ? String(tech_stack).split(',').map(s => s.trim()).filter(Boolean) : []);

      const newJob = await db.job.create({
        data: {
          title,
          company,
          location,
          description,
          salary_min: salary_min ? parseInt(String(salary_min)) : null,
          salary_max: salary_max ? parseInt(String(salary_max)) : null,
          employer_id: parsedEmployerId,
          tenant_id: computedTenantId,
          status: 'ACTIVE',
          years_experience: years_experience || null,
          mandatory_skills: mandSkillsArray,
          tech_stack: techStackArray,
        }
      });

      return NextResponse.json({ success: true, message: 'Job created successfully', job: newJob });
    }

    if (action === 'UPDATE_JOB') {
      const { id, title, company, location, description, salary_min, salary_max, employer_id, years_experience, mandatory_skills, tech_stack, status } = payload;
      if (!id) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
      }

      let parsedEmployerId = employer_id ? parseInt(employer_id) : null;
      let computedTenantId = null;

      if (parsedEmployerId) {
        const emp = await db.user.findUnique({ where: { id: parsedEmployerId } });
        if (emp) {
          computedTenantId = emp.tenant_id;
        }
      }

      const mandSkillsArray = Array.isArray(mandatory_skills) 
        ? mandatory_skills 
        : (mandatory_skills ? String(mandatory_skills).split(',').map(s => s.trim()).filter(Boolean) : []);
      
      const techStackArray = Array.isArray(tech_stack) 
        ? tech_stack 
        : (tech_stack ? String(tech_stack).split(',').map(s => s.trim()).filter(Boolean) : []);

      const updatedJob = await db.job.update({
        where: { id: parseInt(id) },
        data: {
          title,
          company,
          location,
          description,
          salary_min: salary_min ? parseInt(String(salary_min)) : null,
          salary_max: salary_max ? parseInt(String(salary_max)) : null,
          employer_id: parsedEmployerId,
          tenant_id: computedTenantId,
          status: status || 'ACTIVE',
          years_experience: years_experience || null,
          mandatory_skills: mandSkillsArray,
          tech_stack: techStackArray,
        }
      });

      return NextResponse.json({ success: true, message: 'Job updated successfully', job: updatedJob });
    }

    if (action === 'DELETE_JOB') {
      const { jobId } = payload;
      if (!jobId) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
      }

      await db.job.delete({ where: { id: parseInt(jobId) } });
      return NextResponse.json({ success: true, message: `Job #${jobId} deleted.` });
    }

    // ==========================================
    // 4. MANUAL CANDIDATE-EMPLOYER MATCHING
    // ==========================================
    if (action === 'MANUAL_MATCH') {
      const { candidate_id, job_id, match_score, matched_skills, missing_skills, recommendation, fit_summary } = payload;
      if (!candidate_id || !job_id) {
        return NextResponse.json({ error: 'Candidate and Job selections are required' }, { status: 400 });
      }

      const parsedCandId = parseInt(candidate_id);
      const parsedJobId = parseInt(job_id);

      // Verify entities exist
      const cand = await db.user.findUnique({ where: { id: parsedCandId } });
      const job = await db.job.findUnique({ where: { id: parsedJobId } });

      if (!cand || cand.role !== 'CANDIDATE') {
        return NextResponse.json({ error: 'Valid Candidate not found' }, { status: 400 });
      }
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 400 });
      }

      // Create unique match record
      const matchScoreVal = match_score ? parseInt(String(match_score)) : 95;
      const jobMatch = await db.jobMatch.upsert({
        where: {
          candidate_id_job_id: {
            candidate_id: parsedCandId,
            job_id: parsedJobId
          }
        },
        update: {
          match_score: matchScoreVal,
          matched_skills: matched_skills || 'Manually Assigned',
          missing_skills: missing_skills || 'None',
          recommendation: recommendation || 'Highly recommended by admin override.',
          fit_summary: fit_summary || 'Matched manually by system root administrator.',
        },
        create: {
          candidate_id: parsedCandId,
          job_id: parsedJobId,
          match_score: matchScoreVal,
          matched_skills: matched_skills || 'Manually Assigned',
          missing_skills: missing_skills || 'None',
          recommendation: recommendation || 'Highly recommended by admin override.',
          fit_summary: fit_summary || 'Matched manually by system root administrator.',
        }
      });

      // Create connected active job application so employer sees candidate immediately in listing
      const jobApplication = await db.jobApplication.upsert({
        where: {
          candidate_id_job_id: {
            candidate_id: parsedCandId,
            job_id: parsedJobId
          }
        },
        update: {
          status: 'Reviewed' // Reviewed is high quality status indicating active admin review
        },
        create: {
          candidate_id: parsedCandId,
          job_id: parsedJobId,
          status: 'Reviewed'
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Candidate manually matched to employer job post. An active Application was placed in their review loop!',
        match: jobMatch,
        application: jobApplication
      });
    }

    // ==========================================
    // 5. EXISTING ACTIONS
    // ==========================================
    if (action === 'RESCORE_ALL') {
      return NextResponse.json({ success: true, message: 'System-wide re-score triggered and queued successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Superadmin Override Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
