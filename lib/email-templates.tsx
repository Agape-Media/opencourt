import { render } from "@react-email/components"
import { WaitlistLaunchEmail } from "@/emails/waitlist-launch"
import { WaitlistNotificationEmail } from "@/emails/waitlist-notification"
import { WaitlistWelcomeEmail } from "@/emails/waitlist-welcome"

export const renderWaitlistWelcomeEmail = (email: string) => {
  return render(<WaitlistWelcomeEmail email={email} />)
}

export const renderWaitlistNotificationEmail = (
  email: string,
  signupTime: string
) => {
  return render(
    <WaitlistNotificationEmail email={email} signupTime={signupTime} />
  )
}

export const renderWaitlistLaunchEmail = (email: string) => {
  return render(<WaitlistLaunchEmail email={email} />)
}
