import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET is not set in environment variables");
}

const key = new TextEncoder().encode(secretKey);

export async function createSession(userId: string, role: string) {
  const session = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h") // ⬅️ use "8h" instead of "8hrs"
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only secure in prod
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours in seconds
  });
}

export async function decrypt(sessionToken?: string): Promise<JWTPayload | null> {
  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("❌ Failed to verify session:", error);
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  return decrypt(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expire immediately
  });
}
