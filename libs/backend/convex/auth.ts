"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import jwt from "jsonwebtoken";

import crypto from "crypto";

import { Id } from "./_generated/dataModel";

export const authenticateUser = internalAction({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const user = await ctx.runQuery(internal.user.getByUsername, {
      username,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await verifyPassword(password, user.hashedPassword);

    if (user && isPasswordValid) {
      const token: string = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        {
          expiresIn: "24h",
        }
      );

      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      const sessionId: Id<"session"> = await ctx.runMutation(
        internal.sessions.createSession,
        {
          userId: user._id,
          expiresAt: expiresAt,
        }
      );

      return { token, sessionId };
    } else {
      throw new Error("Authentication failed");
    }
  },
});

async function verifyPassword(password: string, hashedPassword: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex === hashedPassword;
}
