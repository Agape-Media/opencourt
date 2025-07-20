import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { api } from '@/convex/_generated/api';
import { renderWaitlistLaunchEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export async function POST() {
  try {
    // Get all unnotified emails from Convex
    const unnotifiedEmails = await convex.query(
      api.waitlist.getUnnotifiedEmails
    );

    if (unnotifiedEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails to send',
        count: 0,
      });
    }

    const results = [];
    const emailIds = [];

    // Send launch email to each user
    for (const emailRecord of unnotifiedEmails) {
      try {
        const launchEmailHtml = await renderWaitlistLaunchEmail(
          emailRecord.email
        );

        await resend.emails.send({
          from: 'OpenCourt <noreply@opencourtpb.com>',
          to: [emailRecord.email],
          subject: 'OpenCourt is Live! 🎾',
          html: launchEmailHtml,
        });

        results.push({ email: emailRecord.email, success: true });
        emailIds.push(emailRecord._id);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Error logging for individual email failures
        console.error(
          `Failed to send launch email to ${emailRecord.email}:`,
          error
        );
        results.push({
          email: emailRecord.email,
          success: false,
          error: String(error),
        });
      }
    }

    // Mark successfully sent emails as notified
    if (emailIds.length > 0) {
      await convex.mutation(api.waitlist.markEmailsAsNotified, { emailIds });
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} of ${unnotifiedEmails.length} launch emails`,
      count: successCount,
      results,
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error logging for batch email failures
    console.error('Launch emails error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to send launch emails' },
      { status: 500 }
    );
  }
}
