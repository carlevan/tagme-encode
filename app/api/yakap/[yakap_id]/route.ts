// app/api/yakap/[yakap_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, context: { params: Promise<{ yakap_id: string }> }) {
  // Unwrap params correctly
  const { yakap_id } = await context.params; // <--- must await

  if (!yakap_id) {
    return NextResponse.json({ error: "Missing yakap_id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { fullname, brgy_id } = body;

    if (!fullname || !brgy_id) {
      return NextResponse.json({ error: "fullname and brgy_id required" }, { status: 400 });
    }

    const updated = await prisma.yakap.update({
      where: { yakap_id },
      data: { fullname, brgy_id },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR RESPONSE:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
