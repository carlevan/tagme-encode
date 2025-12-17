import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerRequestSchema,
  userPublicSchema,
} from "@/lib/yakapSchemas";

export const runtime = "nodejs"; // ensure Node runtime so bcryptjs is happy

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerRequestSchema.parse(body);

    // Check username uniqueness
    const existing = await prisma.user.findUnique({
      where: { username: parsed.username },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "username_taken" },
        { status: 409 },
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(parsed.password, 10);

    const created = await prisma.user.create({
      data: {
        username: parsed.username,
        password: hashed,
        name: parsed.name,
        role: parsed.role ?? "ENCODER", // default from schema/model
      },
    });

    // Shape to public user object (no password)
    const safe = userPublicSchema.parse({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    return NextResponse.json(
      { ok: true, user: safe },
      { status: 201 },
    );
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { ok: false, error: "invalid_body", details: err.issues },
        { status: 400 },
      );
    }
    console.error("REGISTER ERROR", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
