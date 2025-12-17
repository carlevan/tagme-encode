import { decrypt } from "./session";
import { cookies } from "next/headers";

// Define the session type
export type Session = {
  userId: string;
  role: "ADMIN" | "ENCODER";
};

// Update getUser
export async function getUser(cookiesHeader?: string): Promise<Session | null> {
  let sessionToken: string | undefined;

  if (cookiesHeader) {
    sessionToken = cookiesHeader
      .split("; ")
      .find((c) => c.startsWith("session="))
      ?.split("=")[1];
  } else {
    const cookiesStore = await cookies();
    sessionToken = cookiesStore.get("session")?.value;
  }

  if (!sessionToken) return null;

  const session = await decrypt(sessionToken);
  return session as Session | null;
}
