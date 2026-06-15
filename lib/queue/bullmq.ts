import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisConnection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

// Ensure correct TS singleton pattern for Next.js dev server.
const globalForBull = global as unknown as { 
  notificationQueue: Queue;
};

// 1. Queue Definition
export const notificationQueue = globalForBull.notificationQueue || new Queue('Notifications', {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  }
});
if (process.env.NODE_ENV !== 'production') globalForBull.notificationQueue = notificationQueue;

// 2. Queue Events (for lifecycle logging)
export const notificationQueueEvents = new QueueEvents('Notifications', { connection: redisConnection as any });

// 3. Setup Next.js-compatible Worker
export function initWorkers() {
    console.log('[BullMQ] Starting Notification Worker in Next.js backend context...');
    
    new Worker('Notifications', async job => {
        switch(job.name) {
            case 'send-email':
               // import target execution function dynamically or call directly
               console.log(`[Worker] Sending Email to ${job.data.to}`);
               break;
            case 'send-sms':
               console.log(`[Worker] Sending SMS to ${job.data.phone}`);
               break;
            default:
               throw new Error(`Unknown job type: ${job.name}`);
        }
    }, { connection: redisConnection as any });
}
