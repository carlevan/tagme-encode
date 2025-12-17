// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  loginRequestSchema,
  loginUserSchema,
} from "@/lib/yakapSchemas";
// import { signAuthToken } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { username, password } = loginRequestSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "invalid_credentials" },
        { status: 401 },
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "invalid_credentials" },
        { status: 401 },
      );
    }

    // Zod-check the public shape we expose
    const publicUser = loginUserSchema.parse({
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    // const token = signAuthToken(publicUser);

    const res = NextResponse.json(
      { ok: true, user: publicUser },
      { status: 200 },
    );

    // res.cookies.set("yakap_token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: 60 * 60 * 24, // 1 day
    // });

    return res;
  } catch (err: any) {
    console.error("login error", err);
    return NextResponse.json(
      { ok: false, error: "login_failed" },
      { status: 400 },
    );
  }
}
