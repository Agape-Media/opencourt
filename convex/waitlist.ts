import { mutation, query, internalMutation } from "./_generated/server";

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query("waitlistCounter").first();
    return counter?.count ?? 0;
  },
});

export const incrementCount = mutation({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query("waitlistCounter").first();

    if (counter) {
      await ctx.db.patch(counter._id, { count: counter.count + 1 });
      return counter.count + 1;
    } else {
      await ctx.db.insert("waitlistCounter", { count: 1 });
      return 1;
    }
  },
});

export const initializeCount = mutation({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query("waitlistCounter").first();

    if (!counter) {
      await ctx.db.insert("waitlistCounter", { count: 42 });
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

    const counter = await ctx.db.query("waitlistCounter").first();

    if (counter) {
      await ctx.db.patch(counter._id, { count: counter.count + 1 });
    } else {
      await ctx.db.insert("waitlistCounter", { count: 1 });
    }
  },
});
