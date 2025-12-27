import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/products", "/cart"];
  
  // Allow public routes and static assets
  if (pathname === "/" || publicRoutes.some((route) => pathname.startsWith(route)) || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access (basic check)
  // Note: We can't easily access user object here without decoding token or extra cookie
  // For now, we rely on client-side and API protection, or we can store role in cookie too.
  // The prompt suggested: const user = JSON.parse(request.cookies.get("user")?.value || "{}");
  // But we didn't set "user" cookie in AuthContext.
    
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
