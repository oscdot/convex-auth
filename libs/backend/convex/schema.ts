import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    user: v.id("user"),
  }),
  user: defineTable({
    username: v.string(),
    hashedPassword: v.string(),
    email: v.optional(v.string()),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"]),
  session: defineTable({
    userId: v.id("user"),
    expiresAt: v.number(),
  }),
});
