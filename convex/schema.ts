import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  waitlistEmails: defineTable({
    email: v.string(),
    signupDate: v.number(),
    notified: v.optional(v.boolean()),
    deliveryTrackingEnabled: v.optional(v.boolean()),
    welcomeEmailSentAt: v.optional(v.number()),
    notificationEmailSentAt: v.optional(v.number()),
  }).index('by_email', ['email']),
});
