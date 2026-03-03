import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLog = mutation({
  args: {
    jobId: v.string(),
    estimatedCredits: v.number(),
    resolution: v.union(v.literal("720p"), v.literal("1080p"), v.literal("4k")),
    seconds: v.union(v.literal(5), v.literal(10), v.literal(15)),
    highQuality: v.boolean(),
    aspectRatio: v.union(v.literal("9:16"), v.literal("1:1"), v.literal("16:9")),
    userId: v.optional(v.string()),
    createdAt: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("billingLogs", args);
  }
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("billingLogs").order("desc").take(50);
  }
});
