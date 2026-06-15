import { notificationQueue } from '../lib/queue/bullmq';

export class NotificationService {
  /**
   * Enqueues an email to be sent asynchronously
   */
  static async queueEmail(to: string, subject: string, bodyText: string) {
    if (!process.env.REDIS_URL) {
      console.warn('[NotificationService] No REDIS_URL, sending synchronously (mock)');
      // For development w/o redis
      return;
    }
    
    await notificationQueue.add('send-email', {
      to,
      subject,
      bodyText
    });
  }

  /**
   * Enqueues an SMS to be sent asynchronously
   */
  static async queueSMS(phone: string, message: string) {
    if (!process.env.REDIS_URL) {
      console.warn('[NotificationService] No REDIS_URL, sending synchronously (mock)');
      return;
    }
    
    await notificationQueue.add('send-sms', {
      phone,
      message
    });
  }
}
