import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTranscript = mutation({
  args: {
    userId: v.optional(v.string()),
    sourceUrl: v.string(),
    provider: v.string(),
    text: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("transcripts", {
      ...args,
      createdAt: Date.now()
    });
  }
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transcripts").order("desc").take(20);
  }
});
