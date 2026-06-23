import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CandidateService {
  static async getProfile(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
         id: true, name: true, email: true, professional_title: true, experience_level: true, resume_text: true, role: true, phone: true, linkedin_url: true, github_url: true 
      }
    });
  }

  static async submitApplication(candidateId: number, jobId: number, tenantId?: string) {
    return prisma.jobApplication.create({
      data: {
        candidate_id: candidateId,
        job_id: jobId,
        status: 'Pending'
      }
    });
  }
}
