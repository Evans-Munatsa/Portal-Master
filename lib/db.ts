import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Next.js fast refresh can cause multiple database connections. 
// We attach the Prisma Client to the global object in development to prevent connection exhaustion.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * A highly resilient query execution wrapper designed for production.
 * Executes a database callback with exponential backoff on connection drops or transient failures.
 */
export async function resilientQuery<T>(
  queryFn: (db: PrismaClient) => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await queryFn(prisma);
    } catch (error: any) {
      attempt++;
      console.warn(`[DB WARNING] Query failed on attempt ${attempt}. Retrying... Error: ${error.message}`);
      
      // If we've reached the max retries, throw the error
      if (attempt >= maxRetries) {
        console.error(`[DB ERROR] Query failed after ${maxRetries} attempts.`);
        throw error;
      }

      // Exponential backoff
      await new Promise(res => setTimeout(res, 200 * Math.pow(2, attempt)));
    }
  }
  throw new Error('Unreachable');
}

export default prisma;
