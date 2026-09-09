import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { renderWaitlistLaunchEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/resend';
import { getRequiredEnv, isAuthorizedRequest } from '@/lib/server-utils';

const launchEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedRequest(request, getRequiredEnv('WAITLIST_API_SECRET'))) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = launchEmailSchema.parse(body);

    const launchEmailHtml = await renderWaitlistLaunchEmail(email);

    await sendEmail({
      from: 'OpenCourt <noreply@opencourtpb.com>',
      to: [email],
      subject: 'OpenCourt is Live! 🎾',
      html: launchEmailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Launch email sent successfully!',
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error logging for email delivery failures
    console.error('Launch email error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send launch email' },
      { status: 500 }
    );
  }
}
