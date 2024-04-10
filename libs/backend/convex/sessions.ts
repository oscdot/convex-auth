import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const createSession = internalMutation({
  args: {
    userId: v.id("user"),
    expiresAt: v.number(),
  },
  handler: async (ctx, { userId, expiresAt }) => {
    const newSessionId = await ctx.db.insert("session", {
      userId,
      expiresAt,
    });

    return newSessionId;
  },
});

export const validateSession = query({
  args: { sessionId: v.id("session") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return false;
    }
    return true;
  },
});
