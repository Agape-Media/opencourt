import { WaitlistWrapper } from '@/components/box';
import { WaitlistFormWrapper } from '@/components/waitlist-form-wrapper';
import { waitlistConfig } from '@/lib/content';
export const dynamic = 'force-static';
export const revalidate = 30;

export default async function Home() {
  const formAction = async (
    data: FormData
  ): Promise<{ success: true } | { success: false; error: string }> => {
    'use server';

    const email = data.get('email') as string;

    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }

    try {
      const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/waitlist`;
      // biome-ignore lint/suspicious/noConsole: Debug logging for API URL
      console.log('Fetching URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // biome-ignore lint/suspicious/noConsole: Debug logging for response status
      console.log('Response status:', response.status);
      // biome-ignore lint/suspicious/noConsole: Debug logging for response headers
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const text = await response.text();
        // biome-ignore lint/suspicious/noConsole: Debug logging for error response
        console.log('Error response body:', text);
        return {
          success: false,
          error: `Server error: ${response.status}`,
        };
      }

      await response.json();
      return { success: true };
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Error logging for waitlist submission failures
      console.error('Waitlist submission error:', error);
      return {
        success: false,
        error: 'There was an error while submitting the form',
      };
    }
  };

  return (
    <WaitlistWrapper>
      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white whitespace-pre-wrap text-pretty">
          {waitlistConfig.title}
        </h1>
        <div className="text-white/80 [&>p]:tracking-tight text-pretty">
          <p>{waitlistConfig.subtitle}</p>
        </div>
      </div>
      {/* Form */}
      <WaitlistFormWrapper serverAction={formAction} />
    </WaitlistWrapper>
  );
}
