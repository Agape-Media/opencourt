import { mutation } from './_generated/server';

export const initializeCounter = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('waitlistCounter').first();

    if (!existing) {
      await ctx.db.insert('waitlistCounter', { count: 1247 });
      return 1247;
    }

    return existing.count;
  },
});
