"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import jwt from "jsonwebtoken";

import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { Id } from "./_generated/dataModel";

export const authenticateUser = action({
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

      // Calculate expiration date for the session, e.g., 24 hours from now
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      // Create a new session in the database
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

const scryptAsync = promisify(scrypt);

export const createUser = action({
  args: {
    username: v.string(),
    password: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { username, password, email }) => {
    // Generate a salt
    const salt = randomBytes(16).toString("hex");
    // Hash the password using the salt
    const hashedBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedPassword = `${salt}.${hashedBuffer.toString("hex")}`;

    // Insert the new user record into the database
    const newUser = await ctx.runMutation(internal.user.createUser, {
      username,
      hashedPassword,
      email,
    });
  },
});

async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // Extract the salt from the stored hashedPassword
  const [salt, storedHash] = hashedPassword.split(".");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;

  return buf.toString("hex") === storedHash;
}
