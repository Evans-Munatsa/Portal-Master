import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InterviewService {
  static async proposeInterview(applicationId: number, employerId: number, candidateId: number, proposedTime: Date, notes?: string, tenantId?: string) {
    const interview = await prisma.interview.create({
      data: {
        application_id: applicationId,
        employer_id: employerId,
        candidate_id: candidateId,
        proposed_time: proposedTime,
        notes,
        status: 'Proposed'
      }
    });

    // Automatically update app status
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'Interviewing' }
    });

    return interview;
  }

  static async updateInterviewStatus(interviewId: number, status: string, tenantId?: string) {
    return prisma.interview.update({
      where: { id: interviewId },
      data: { status }
    });
  }
}
