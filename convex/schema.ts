import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  waitlistCounter: defineTable({
    count: v.number(),
  }),
  waitlistEmails: defineTable({
    email: v.string(),
    signupDate: v.number(),
    notified: v.optional(v.boolean()),
  }).index('by_email', ['email']),
});
