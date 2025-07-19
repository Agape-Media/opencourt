"use client";
import { InputForm } from "@/components/waitlist-form";
import { WaitlistCounter } from "@/components/waitlist-counter";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { waitlistConfig } from "@/lib/content";

type WaitlistFormWrapperProps = {
  serverAction: (
    data: FormData,
  ) => Promise<{ success: true } | { success: false; error: string }>;
};

export function WaitlistFormWrapper({
  serverAction,
}: WaitlistFormWrapperProps) {
  const incrementCounter = useMutation(api.waitlist.incrementCount);

  const handleFormAction = async (data: FormData) => {
    const result = await serverAction(data);

    if (result.success) {
      try {
        await incrementCounter();
      } catch (error) {
        console.error("Failed to increment counter:", error);
      }
    }

    return result;
  };

  return (
    <div className="px-1 flex flex-col w-full self-stretch">
      <InputForm
        name="email"
        type="email"
        placeholder={waitlistConfig.form.emailPlaceholder}
        required
        buttonCopy={{
          idle: waitlistConfig.form.submitText,
          success: waitlistConfig.form.successMessage,
          loading: "Joining...",
        }}
        formAction={handleFormAction}
      />
      <WaitlistCounter />
    </div>
  );
}
