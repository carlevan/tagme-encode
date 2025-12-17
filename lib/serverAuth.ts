// lib/serverAuth.ts
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { NextRequest } from "next/server";

// Shape of what we put into the JWT
const authPayloadSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  role: z.string(),
  name: z.string().nullable().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type AuthUser = z.infer<typeof authPayloadSchema>;

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Sign a token for a given user
export function signAuthToken(user: {
  user_id: string;
  username: string;
  role: string;
  name?: string | null;
}) {
  const payload = {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
    name: user.name ?? null,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

// Verify token string -> AuthUser (throws on error)
export function verifyAuthToken(token: string): AuthUser {
  const decoded = jwt.verify(token, JWT_SECRET);
  return authPayloadSchema.parse(decoded);
}

// Get user from NextRequest cookies (returns null if no/invalid token)
export function getUserFromRequest(req: NextRequest): AuthUser | null {
  const token = req.cookies.get("yakap_token")?.value;
  if (!token) return null;

  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

// Throw if not logged in (handy inside API routes)
export function requireUser(req: NextRequest): AuthUser {
  const user = getUserFromRequest(req);
  if (!user) {
    const err = new Error("unauthorized");
    // @ts-expect-error custom httpStatus
    err.httpStatus = 401;
    throw err;
  }
  return user;
}
