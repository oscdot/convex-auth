// convex/myFunctions.ts
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    // Search for a user by username in the 'users' collection
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("username"), username))
      .first();
    // Return the user object if found, otherwise return null
    return user;
  },
});

export const createUser = internalMutation({
  args: {
    username: v.string(),
    hashedPassword: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, { username, hashedPassword, email }) => {
    // Insert the new user record into the 'users' collection
    const newUser = await ctx.db.insert("user", {
      username,
      hashedPassword,
      email,
    });

    // Return the new user object
    return newUser;
  },
});
