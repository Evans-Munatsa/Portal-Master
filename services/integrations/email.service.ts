import sgMail from '@sendgrid/mail';

// Lazy init similar to Stripe for API keys
let isConfigured = false;

export class EmailService {
  static configure() {
    if (!isConfigured) {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is missing');
      }
      sgMail.setApiKey(apiKey);
      isConfigured = true;
    }
  }

  static async send(to: string, subject: string, text: string, html?: string) {
    this.configure();

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@launchpath.co.za', // Verified sender
      subject,
      text,
      html: html || text,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('[EmailService] Error sending email via SendGrid', error);
      throw error;
    }
  }
}
