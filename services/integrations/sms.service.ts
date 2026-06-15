import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

export class SMSService {
  static getClient() {
    if (!twilioClient) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      if (!accountSid || !authToken) {
        throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
      }
      twilioClient = twilio(accountSid, authToken);
    }
    return twilioClient;
  }

  static async sendSMS(to: string, message: string) {
    const client = this.getClient();
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    try {
      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to
      });
      return result;
    } catch (error) {
      console.error('[SMSService] Error sending SMS via Twilio', error);
      throw error;
    }
  }
}
