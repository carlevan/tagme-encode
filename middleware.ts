// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only these pages are reachable without a session
const PUBLIC_PATHS = ["/", "/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Skip Next.js internals & static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2) API rules
  if (pathname.startsWith("/api")) {
    // ⬇️ Only /api/login is public
    if (pathname === "/api/login") {
      return NextResponse.next();
    }

    // Everything else under /api requires yakap_session
    const token = req.cookies.get("yakap_session")?.value;
    if (!token) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.next();
  }

  // 3) App routes
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const token = req.cookies.get("yakap_session")?.value;

  // Not logged in → trying to access protected page (/yakap, /register, etc.)
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → trying to go to public routes (/ or /login) → bounce to /yakap
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/yakap", req.url));
  }

  // Otherwise just continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
