'use client';
import { WaitlistCounter } from '@/components/waitlist-counter';
import { InputForm } from '@/components/waitlist-form';
import { waitlistConfig } from '@/lib/content';

type WaitlistFormWrapperProps = {
  serverAction: (
    data: FormData
  ) => Promise<{ success: true } | { success: false; error: string }>;
};

export function WaitlistFormWrapper({
  serverAction,
}: WaitlistFormWrapperProps) {
  return (
    <div className="px-1 flex flex-col w-full self-stretch gap-4">
      <InputForm
        name="email"
        type="email"
        placeholder={waitlistConfig.form.emailPlaceholder}
        required
        buttonCopy={{
          idle: waitlistConfig.form.submitText,
          success: waitlistConfig.form.successMessage,
          loading: 'Joining...',
        }}
        formAction={serverAction}
      />
      <WaitlistCounter />
    </div>
  );
}
