import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type UserRole = "customer" | "vendor" | "agent" | "admin";

function roleHomePath(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  if (role === "agent") return "/agent/dashboard";
  return "/";
}

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}

function isProtectedPath(pathname: string) {
  if (pathname.startsWith("/vendor")) return true;
  if (pathname.startsWith("/agent")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/cart") return true;
  if (pathname === "/checkout") return true;
  if (pathname.startsWith("/orders")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const user = token ? { id: token.sub, role: token.role as UserRole | undefined } : null;

  const pathname = request.nextUrl.pathname;

  // Logged out trying to access protected routes
  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If not logged in, auth pages are fine
  if (!user) return response;

  // Fetch role for routing decisions
  const role = user.role ?? "customer";

  // Logged in visiting /login or /signup -> send home
  if (isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Role guards
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/vendor") && role !== "vendor" && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/agent") && role !== "agent" && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

