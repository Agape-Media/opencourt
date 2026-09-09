import { ConvexHttpClient } from 'convex/browser';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { api } from '@/convex/_generated/api';
import {
  renderWaitlistNotificationEmail,
  renderWaitlistWelcomeEmail,
} from '@/lib/email-templates';
import { sendEmail } from '@/lib/resend';
import { getRequiredEnv } from '@/lib/server-utils';

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = waitlistSchema.parse(body);
    const secret = getRequiredEnv('WAITLIST_API_SECRET');
    const convex = new ConvexHttpClient(
      getRequiredEnv('NEXT_PUBLIC_CONVEX_URL')
    );

    const registration = await convex.mutation(api.waitlist.registerEmail, {
      email,
      secret,
    });

    if (!registration.welcomeEmailSent) {
      try {
        const welcomeEmailHtml = await renderWaitlistWelcomeEmail(email);

        await sendEmail({
          from: 'OpenCourt <noreply@opencourtpb.com>',
          to: [email],
          subject: 'Welcome to OpenCourt',
          html: welcomeEmailHtml,
        });
        await convex.mutation(api.waitlist.markEmailSent, {
          emailId: registration.emailId,
          emailType: 'welcome',
          secret,
        });
      } catch (error) {
        // The signup remains successful if email delivery is unavailable. Its
        // pending state can be retried by resubmission.
        // biome-ignore lint/suspicious/noConsole: Operational email failure
        console.error('Welcome email error:', error);
      }
    }

    if (!registration.notificationEmailSent) {
      try {
        const signupTime = new Date().toLocaleString();
        const notificationEmailHtml = await renderWaitlistNotificationEmail(
          email,
          signupTime
        );

        await sendEmail({
          from: 'OpenCourt <noreply@opencourtpb.com>',
          to: ['admin@opencourtpb.com'],
          subject: 'New OpenCourt Waitlist Signup',
          html: notificationEmailHtml,
        });
        await convex.mutation(api.waitlist.markEmailSent, {
          emailId: registration.emailId,
          emailType: 'notification',
          secret,
        });
      } catch (error) {
        // The signup and welcome email remain successful if only the internal
        // notification fails. Its pending state can be retried by resubmission.
        // biome-ignore lint/suspicious/noConsole: Operational email failure
        console.error('Waitlist notification email error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      isNew: registration.isNew,
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error logging for waitlist signup failures
    console.error('Waitlist signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
