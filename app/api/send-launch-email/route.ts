import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { renderWaitlistLaunchEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const launchEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = launchEmailSchema.parse(body);

    const launchEmailHtml = await renderWaitlistLaunchEmail(email);

    await resend.emails.send({
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
