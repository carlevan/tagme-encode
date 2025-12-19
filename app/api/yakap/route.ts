// app/api/yakap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createYakapRequestSchema,
  yakapCoreSchema,
  yakapRowSchema,
  yakapListResponseSchema,
} from "@/lib/yakapSchemas";

/* ============================
   GET: Public Yakap List
============================ */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const brgy = url.searchParams.get("brgy") || undefined;
    const date = url.searchParams.get("date") || undefined;

    // Build filter
    const where: any = {};
    if (brgy) where.brgy_id = brgy;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    const rows = await prisma.yakap.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const safe = rows.map((y) =>
      yakapRowSchema.parse({
        yakap_id: y.yakap_id,
        fullname: y.fullname,
        address: y.address,
        brgy_id: y.brgy_id,
        user_id: y.user_id,
        createdAt: y.createdAt.toISOString(),
        updatedAt: y.updatedAt.toISOString(),
      }),
    );

    const payload = yakapListResponseSchema.parse({
      ok: true,
      data: safe,
    });

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/yakap error:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}


/* ============================
   POST: Public Create Yakap
============================ */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = createYakapRequestSchema.parse(json);

    const created = await prisma.yakap.create({
      data: {
        fullname: parsed.fullname,
        address: parsed.address ?? null,
        brgy_id: parsed.brgy_id,
        user_id: parsed.user_id,
      },
    });

    const core = yakapCoreSchema.parse({
      yakap_id: created.yakap_id,
      fullname: created.fullname,
      address: created.address,
      brgy_id: created.brgy_id,
      user_id: created.user_id,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });

    return NextResponse.json({ ok: true, yakap: core }, { status: 201 });

  } catch (err: any) {
    // ✅ UNIQUE CONSTRAINT
    if (err?.code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          error: "duplicate",
          message:
            "This fullname is already registered in this barangay.",
        },
        { status: 409 },
      );
    }

    console.error("POST /api/yakap error:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
