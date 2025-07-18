import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = waitlistSchema.parse(body);

    // Add to waitlist (you could store in a database here)
    // For now, we'll just send a confirmation email

    await resend.emails.send({
      from: "OpenCourt <noreply@opencourt.com>",
      to: [email],
      subject: "Welcome to the OpenCourt Waitlist!",
      html: `
        <h1>Welcome to OpenCourt!</h1>
        <p>Thank you for joining our waitlist. We're excited to have you on board!</p>
        <p>We'll notify you as soon as we launch. In the meantime, follow us for updates.</p>
        <p>Best regards,<br>The OpenCourt Team</p>
      `,
    });

    // Optionally, send a notification to yourself about the new signup
    await resend.emails.send({
      from: "OpenCourt <noreply@opencourt.com>",
      to: ["team@opencourt.com"], // Replace with your email
      subject: "New Waitlist Signup",
      html: `
        <h1>New Waitlist Signup</h1>
        <p>Email: ${email}</p>
        <p>Signed up at: ${new Date().toISOString()}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist!",
    });
  } catch (error) {
    console.error("Waitlist signup error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
