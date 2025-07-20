import { WaitlistNotificationEmail } from "@/emails/waitlist-notification"
import { WaitlistWelcomeEmail } from "@/emails/waitlist-welcome"

export default function EmailPreview() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Preview</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Welcome Email
            </h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <WaitlistWelcomeEmail email="test@example.com" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Notification Email
            </h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <WaitlistNotificationEmail
                email="test@example.com"
                signupTime={new Date().toLocaleString()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
