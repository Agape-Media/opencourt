import { render } from "@react-email/components";
import { WaitlistWelcomeEmail } from "@/emails/waitlist-welcome";
import { WaitlistNotificationEmail } from "@/emails/waitlist-notification";

export const renderWaitlistWelcomeEmail = (email: string) => {
  return render(<WaitlistWelcomeEmail email={email} />);
};

export const renderWaitlistNotificationEmail = (
  email: string,
  signupTime: string,
) => {
  return render(
    <WaitlistNotificationEmail email={email} signupTime={signupTime} />,
  );
};
