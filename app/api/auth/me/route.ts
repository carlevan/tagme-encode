// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userPublicSchema } from "@/lib/yakapSchemas";

export async function GET(req: NextRequest) {
  try {
    const sessionUserId = req.cookies.get("yakap_session")?.value;

    if (!sessionUserId) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { user_id: sessionUserId },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "user_not_found" },
        { status: 404 },
      );
    }

    const publicUser = userPublicSchema.parse({
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });

    return NextResponse.json({ ok: true, user: publicUser });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
