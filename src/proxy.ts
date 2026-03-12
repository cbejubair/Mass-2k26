import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import { coordinatorDashboardRoles } from "@/lib/coordinators";

const publicPaths = [
  "/api/auth/login",
  "/api/qr/verify",
  "/api/stats",
  "/api/agenda",
];

const publicPages = ["/events", "/faq", "/rules", "/coordinators"];

const DASHBOARD_MAP: Record<string, string> = {
  admin: "/dashboard/admin",
  staff_coordinator: "/dashboard/coordinator",
  class_coordinator: "/dashboard/coordinator",
  faculty_coordinator: "/dashboard/coordinator",
  overall_student_coordinator: "/dashboard/coordinator",
  event_head: "/dashboard/coordinator",
  technical_coordinator: "/dashboard/coordinator",
  discipline_coordinator: "/dashboard/coordinator",
  student: "/dashboard/student",
};

const COORDINATOR_ROLES = new Set(coordinatorDashboardRoles);

function getDashboard(role: string): string {
  return DASHBOARD_MAP[role] || "/dashboard/student";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (publicPages.some((page) => pathname.startsWith(page))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session_token")?.value;
  const session = token ? await verifyTokenEdge(token) : null;

  if (pathname === "/login" || pathname === "/") {
    if (session) {
      return NextResponse.redirect(
        new URL(getDashboard(session.role), req.url),
      );
    }

    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL("/login", req.url));
    if (token) {
      response.cookies.set("session_token", "", { maxAge: 0, path: "/" });
    }

    return response;
  }

  const role = session.role;

  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(getDashboard(role), req.url));
  }

  if (
    pathname.startsWith("/dashboard/coordinator") &&
    !COORDINATOR_ROLES.has(role) &&
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
