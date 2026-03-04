import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function redirectWithCookies(url: string | URL, response: NextResponse) {
  const newResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    newResponse.cookies.set(cookie.name, cookie.value);
  });
  return newResponse;
}

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
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Logged out trying to access protected routes
  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return redirectWithCookies(url, response);
  }

  // If not logged in, auth pages are fine
  if (!user) return response;

  // Fetch role for routing decisions
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  const role = (profile?.role as UserRole | undefined) ?? "customer";

  // Logged in visiting /login or /signup -> send home
  if (isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return redirectWithCookies(url, response);
  }

  // Role guards
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return redirectWithCookies(url, response);
  }

  if (pathname.startsWith("/vendor") && role !== "vendor" && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return redirectWithCookies(url, response);
  }

  if (pathname.startsWith("/agent") && role !== "agent" && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath(role);
    url.search = "";
    return redirectWithCookies(url, response);
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

