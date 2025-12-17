import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const rows = await prisma.brgy.findMany({
      include: {
        city: {
          include: {
            province: true,
          },
        },
      },
      orderBy: { brgy_name: "asc" },
    });

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
