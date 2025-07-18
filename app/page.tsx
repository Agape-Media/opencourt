import { InputForm } from "@/components/waitlist-form";
import { WaitlistWrapper } from "@/components/box";
import { waitlistConfig } from "@/lib/content";
export const dynamic = "force-static";
export const revalidate = 30;

export default async function Home() {
  const formAction = async (
    data: FormData,
  ): Promise<{ success: true } | { success: false; error: string }> => {
    "use server";

    const email = data.get("email") as string;

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/waitlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || "Something went wrong",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Waitlist submission error:", error);
      return {
        success: false,
        error: "There was an error while submitting the form",
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
      <div className="px-1 flex flex-col w-full self-stretch">
        <InputForm
          name="email"
          type="email"
          placeholder={waitlistConfig.form.emailPlaceholder}
          required={true}
          buttonCopy={{
            idle: waitlistConfig.form.submitText,
            success: waitlistConfig.form.successMessage,
            loading: "Joining...",
          }}
          formAction={formAction}
        />
      </div>
    </WaitlistWrapper>
  );
}
