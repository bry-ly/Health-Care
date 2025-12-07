import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Role to dashboard path mapping
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  PATIENT: "/dashboard/patient",
  DOCTOR: "/dashboard/doctor",
  ADMIN: "/dashboard/admin",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check session for protected routes
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = session.user.role as string;
  const userDashboard =
    ROLE_DASHBOARD_MAP[userRole] || ROLE_DASHBOARD_MAP.PATIENT;

  // Redirect /dashboard to role-specific dashboard
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }

  // Check if user is trying to access a dashboard they shouldn't
  const dashboardSegment = pathname.split("/")[2]; // "patient", "doctor", or "admin"
  const allowedSegment = userDashboard.split("/")[2];

  if (
    pathname.startsWith("/dashboard/") &&
    dashboardSegment !== allowedSegment
  ) {
    // Redirect to the user's correct dashboard
    return NextResponse.redirect(new URL(userDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/api/appointments/:path*",
    "/api/doctors/:path*",
  ],
};
