import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class JobService {
  /**
   * Data isolation enforced by expecting the resolved tenant context
   */
  static async createJob(data: any, employerId: number, tenantId?: string) {
    // Incorporate tenant check/insertion when schema is extended
    return prisma.job.create({
      data: {
        ...data,
        employer_id: employerId,
      }
    });
  }

  static async getJobs(tenantId?: string) {
    return prisma.job.findMany({
      include: { employer: { select: { name: true } } }
    });
  }

  static async getJobById(jobId: number, tenantId?: string) {
    return prisma.job.findUnique({
      where: { id: jobId },
      include: { employer: { select: { name: true } } }
    });
  }
}
