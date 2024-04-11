import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("username"), username))
      .first();
    return user;
  },
});

export const createUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, { username, password, email }) => {
    const hashedPassword = await hashPassword(password);

    // Create a new user object
    const newUser = await ctx.db.insert("user", {
      username,
      hashedPassword,
      email,
    });
  },
});

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
