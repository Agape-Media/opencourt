import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query('waitlistCounter').first();
    return counter?.count ?? 0;
  },
});

export const incrementCount = mutation({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query('waitlistCounter').first();

    if (counter) {
      await ctx.db.patch(counter._id, { count: counter.count + 1 });
      return counter.count + 1;
    } else {
      await ctx.db.insert('waitlistCounter', { count: 1 });
      return 1;
    }
  },
});

export const initializeCount = mutation({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query('waitlistCounter').first();

    if (!counter) {
      await ctx.db.insert('waitlistCounter', { count: 42 });
      return 42;
    }

    return counter.count;
  },
});

export const autoIncrementCount = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Random chance to increment (roughly every 8-15 seconds when called every second)
    // This gives us a 1/8 to 1/15 chance each second, averaging to 8-15 second intervals
    const randomChance = Math.random();
    const shouldIncrement = randomChance < 1 / (8 + Math.random() * 7); // Between 1/15 and 1/8 chance

    if (!shouldIncrement) {
      return;
    }

    const counter = await ctx.db.query('waitlistCounter').first();

    if (counter) {
      await ctx.db.patch(counter._id, { count: counter.count + 1 });
    } else {
      await ctx.db.insert('waitlistCounter', { count: 1 });
    }
  },
});

export const addEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query('waitlistEmails')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();

    if (existing) {
      return { success: false, message: 'Email already on waitlist' };
    }

    await ctx.db.insert('waitlistEmails', {
      email,
      signupDate: Date.now(),
      notified: false,
    });

    return { success: true, message: 'Added to waitlist' };
  },
});

export const getAllEmails = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('waitlistEmails').collect();
  },
});

export const getUnnotifiedEmails = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('waitlistEmails')
      .filter((q) => q.neq(q.field('notified'), true))
      .collect();
  },
});

export const markEmailsAsNotified = mutation({
  args: { emailIds: v.array(v.id('waitlistEmails')) },
  handler: async (ctx, { emailIds }) => {
    for (const id of emailIds) {
      await ctx.db.patch(id, { notified: true });
    }
    return { success: true, count: emailIds.length };
  },
});
