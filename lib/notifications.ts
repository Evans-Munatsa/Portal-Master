import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

/**
 * Lazy-initializes and returns the SendGrid client if configured.
 */
function getSendGridClient(): typeof sgMail | null {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return null;
  }
  sgMail.setApiKey(apiKey);
  return sgMail;
}

/**
 * Lazy-initializes and returns the Twilio client if configured.
 */
function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return null;
  }
  return twilio(accountSid, authToken);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a real SendGrid email if configured, else logs structured contents to console.
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  console.log(`[Email Dispatcher] Initiating dispatch to: ${to}`);
  const client = getSendGridClient();
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'alerts@launchpath.com';

  const msg = {
    to,
    from: fromEmail,
    subject,
    html,
    text: text || subject,
  };

  if (!client) {
    console.warn(
      `[MOCK NOTIFICATION SENDER] SendGrid is not fully configured (SENDGRID_API_KEY missing). Email log details below:`
    );
    console.warn(`--------------------------------------------------`);
    console.warn(`FROM:    ${fromEmail}`);
    console.warn(`TO:      ${to}`);
    console.warn(`SUBJECT: ${subject}`);
    console.warn(`TEXT:    ${msg.text}`);
    console.warn(`HTML:    (Truncated in shell logs for spacing and styling)`);
    console.warn(`--------------------------------------------------`);
    return true;
  }

  try {
    await client.send(msg);
    console.log(`[Email Dispatcher] SendGrid successfully emailed: ${to}`);
    return true;
  } catch (err: any) {
    console.error(`[Email Dispatcher] Failed to send email via SendGrid:`, err?.response?.body || err);
    return false;
  }
}

interface SmsOptions {
  to: string;
  body: string;
}

/**
 * Sends a real Twilio SMS if configured, else logs structured contents to console.
 */
export async function sendSMS({ to, body }: SmsOptions): Promise<boolean> {
  console.log(`[SMS Dispatcher] Initiating dispatch to: ${to}`);
  const client = getTwilioClient();
  const fromSMSNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !fromSMSNumber) {
    console.warn(
      `[MOCK NOTIFICATION SENDER] Twilio is not fully configured (TWILIO_ACCOUNT_SID/TWILIO_PHONE_NUMBER missing). SMS log details below:`
    );
    console.warn(`--------------------------------------------------`);
    console.warn(`TO:   ${to}`);
    console.warn(`BODY: ${body}`);
    console.warn(`--------------------------------------------------`);
    return true;
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromSMSNumber,
      to,
    });
    console.log(`[SMS Dispatcher] Twilio successfully sent SMS (SID: ${message.sid}) to: ${to}`);
    return true;
  } catch (err: any) {
    console.error(`[SMS Dispatcher] Failed to send SMS via Twilio:`, err);
    return false;
  }
}

interface WhatsAppOptions {
  to: string;
  body: string;
}

/**
 * Sends a real Twilio WhatsApp if configured, else logs structured contents to console.
 */
export async function sendWhatsApp({ to, body }: WhatsAppOptions): Promise<boolean> {
  console.log(`[WhatsApp Dispatcher] Initiating dispatch to: ${to}`);
  const client = getTwilioClient();
  const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox format

  // Format recipient's phone number as whatsapp equivalent
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  if (!client) {
    console.warn(
      `[MOCK NOTIFICATION SENDER] Twilio is not fully configured (TWILIO_ACCOUNT_SID missing). WhatsApp log details below:`
    );
    console.warn(`--------------------------------------------------`);
    console.warn(`FROM: ${fromWhatsAppNumber}`);
    console.warn(`TO:   ${formattedTo}`);
    console.warn(`BODY: ${body}`);
    console.warn(`--------------------------------------------------`);
    return true;
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromWhatsAppNumber,
      to: formattedTo,
    });
    console.log(`[WhatsApp Dispatcher] Twilio successfully sent WhatsApp (SID: ${message.sid}) to: ${formattedTo}`);
    return true;
  } catch (err: any) {
    console.error(`[WhatsApp Dispatcher] Failed to send WhatsApp via Twilio:`, err);
    return false;
  }
}

interface MultiChannelOptions {
  candidateEmail: string;
  candidatePhone?: string | null;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  proposedTime: Date;
  notes?: string | null;
}

/**
 * Convenience helper to dispatch the same interview invitation across Email, SMS, & WhatsApp channels.
 */
export async function dispatchInterviewInvitation({
  candidateEmail,
  candidatePhone,
  candidateName,
  jobTitle,
  companyName,
  proposedTime,
  notes,
}: MultiChannelOptions) {
  const formattedTime = new Date(proposedTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const emailSubject = `Interview Invitation: ${jobTitle} at ${companyName}`;
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #7145FF; margin-bottom: 20px;">LaunchPath Interview invitation</h2>
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>Congratulations! <strong>${companyName}</strong> has invited you to an interview for the <strong>${jobTitle}</strong> position.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7145FF;">
        <p style="margin: 0; font-weight: bold; color: #334155;">Proposed Date & Time:</p>
        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 15px;">${formattedTime}</p>
        ${notes ? `<p style="margin: 15px 0 0 0; font-weight: bold; color: #334155;">Manager Notes / Link:</p><p style="margin: 5px 0 0 0; color: #64748b;">${notes}</p>` : ''}
      </div>
      <p>Please log in to your <a href="https://launchpath.com/candidate/dashboard?tab=Inbox" style="color: #7145FF; font-weight: bold; text-decoration: none;">LaunchPath Profile</a> to accept or propose alternatives for this interview.</p>
      <p style="margin-top: 300; font-size: 11px; color: #94a3b8;">Best regards,<br/>The LaunchPath Onboarding Team</p>
    </div>
  `;

  const smsText = `LaunchPath Invitation: congrats ${candidateName}! ${companyName} invited you for an interview for "${jobTitle}" on ${formattedTime}. Notes: ${notes || 'none'}. Accept on your LaunchPath dashboard.`;

  // Dispatch Email
  await sendEmail({
    to: candidateEmail,
    subject: emailSubject,
    html: emailHtml,
    text: `Congratulation! ${companyName} invited you to an interview for "${jobTitle}" on ${formattedTime}. Proposes accept and details on LaunchPath.`,
  });

  // Dispatch SMS (if phone number is available)
  if (candidatePhone) {
    await sendSMS({
      to: candidatePhone,
      body: smsText,
    });

    // Send WhatsApp (since the user requests: "and if the number is also associated with their whatsapp we also want to send them a message there")
    await sendWhatsApp({
      to: candidatePhone,
      body: smsText,
    });
  } else {
    console.warn(`[Dispatcher Warning] No phone registered for candidate ${candidateName}. Skipping SMS & WhatsApp channels.`);
  }
}
