// app/api/yakap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createYakapRequestSchema,
  yakapCoreSchema,
  yakapRowSchema,
  yakapListResponseSchema,
} from "@/lib/yakapSchemas";

function todayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const sessionUserId = req.cookies.get("yakap_session")?.value;

    if (!sessionUserId) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const { start, end } = todayRange();

    const rows = await prisma.yakap.findMany({
      where: {
        user_id: sessionUserId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        brgy: {
          include: {
            city: {
              include: {
                province: true,
              },
            },
          },
        },
        user: true,
      },
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
        brgy: y.brgy
          ? {
              brgy_id: y.brgy.brgy_id,
              brgy_name: y.brgy.brgy_name,
              city: y.brgy.city
                ? {
                    city_id: y.brgy.city.city_id,
                    city_name: y.brgy.city.city_name,
                    province: y.brgy.city.province
                      ? {
                          prov_id: y.brgy.city.province.prov_id,
                          prov_name: y.brgy.city.province.prov_name,
                        }
                      : null,
                  }
                : null,
            }
          : null,
        user: y.user
          ? {
              user_id: y.user.user_id,
              username: y.user.username,
              name: y.user.name,
              role: y.user.role,
            }
          : null,
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

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = req.cookies.get("yakap_session")?.value;

    if (!sessionUserId) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    const json = await req.json().catch(() => ({}));
    // NOTE: createYakapRequestSchema no longer has user_id – derived here
    const parsed = createYakapRequestSchema.parse(json);

    const created = await prisma.yakap.create({
      data: {
        fullname: parsed.fullname,
        address: parsed.address ?? null,
        brgy_id: parsed.brgy_id,
        user_id: sessionUserId,
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
  } catch (err) {
    console.error("POST /api/yakap error:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
