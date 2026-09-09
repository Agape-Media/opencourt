import { Resend } from 'resend';
import { getRequiredEnv } from '@/lib/server-utils';

type Email = {
  from: string;
  to: string[];
  subject: string;
  html: string;
};

let resend: Resend | undefined;

export async function sendEmail(email: Email) {
  resend ??= new Resend(getRequiredEnv('RESEND_API_KEY'));
  const { error } = await resend.emails.send(email);

  if (error) {
    throw new Error(`Resend rejected the email: ${error.message}`);
  }
}
