import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check session for protected routes
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  const user = session.user;

  // Redirect /dashboard to role-specific dashboard
  if (pathname === "/dashboard") {
    switch (user.role) {
      case "PATIENT":
        return NextResponse.redirect(
          new URL("/dashboard/patient", request.url)
        );
      case "DOCTOR":
        return NextResponse.redirect(new URL("/dashboard/doctor", request.url));
      case "ADMIN":
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      default:
        return NextResponse.redirect(
          new URL("/dashboard/patient", request.url)
        );
    }
  }

  if (pathname.startsWith("/dashboard/patient") && user.role !== "PATIENT") {
    // Redirect to correct dashboard based on role
    if (user.role === "DOCTOR") {
      return NextResponse.redirect(new URL("/dashboard/doctor", request.url));
    } else if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
  }

  if (pathname.startsWith("/dashboard/doctor") && user.role !== "DOCTOR") {
    // Redirect to correct dashboard based on role
    if (user.role === "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard/patient", request.url));
    } else if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
  }

  if (pathname.startsWith("/dashboard/admin") && user.role !== "ADMIN") {
    // Redirect to correct dashboard based on role
    if (user.role === "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard/patient", request.url));
    } else if (user.role === "DOCTOR") {
      return NextResponse.redirect(new URL("/dashboard/doctor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
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
