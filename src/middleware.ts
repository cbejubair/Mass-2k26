import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

const publicPaths = ["/api/auth/login", "/api/qr/verify"];

const DASHBOARD_MAP: Record<string, string> = {
  admin: "/dashboard/admin",
  class_coordinator: "/dashboard/coordinator",
  student: "/dashboard/student",
};

function getDashboard(role: string): string {
  return DASHBOARD_MAP[role] || "/dashboard/student";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public API paths (no auth needed)
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;
  const session = token ? await verifyTokenEdge(token) : null;

  // --- Handle /login and / (root) for authenticated users ---
  if (pathname === "/login" || pathname === "/") {
    if (session) {
      // Already logged in — redirect to role-based dashboard
      return NextResponse.redirect(
        new URL(getDashboard(session.role), req.url),
      );
    }
    // Not logged in: allow both / (landing page) and /login
    return NextResponse.next();
  }

  // --- Protected routes: require valid session ---
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Clear stale cookie and redirect to login
    const response = NextResponse.redirect(new URL("/login", req.url));
    if (token) {
      response.cookies.set("session_token", "", { maxAge: 0, path: "/" });
    }
    return response;
  }

  // --- Role-based route protection for dashboard pages ---
  const role = session.role;

  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(getDashboard(role), req.url));
  }

  if (
    pathname.startsWith("/dashboard/coordinator") &&
    role !== "class_coordinator" &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL(getDashboard(role), req.url));
  }

  if (pathname.startsWith("/dashboard/student") && role !== "student") {
    return NextResponse.redirect(new URL(getDashboard(role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
