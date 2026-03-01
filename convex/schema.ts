import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transcripts: defineTable({
    userId: v.optional(v.string()),
    sourceUrl: v.string(),
    provider: v.string(),
    text: v.string(),
    createdAt: v.number()
  })
});
