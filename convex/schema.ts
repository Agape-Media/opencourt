import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlistCounter: defineTable({
    count: v.number(),
  }),
});
