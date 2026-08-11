import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard and API routes
  if (
    pathname.startsWith("/collections") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/chats") ||
    pathname.startsWith("/api/collections") ||
    pathname.startsWith("/api/documents") ||
    pathname.startsWith("/api/upload")
  ) {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie?.value) {
      // API routes: return 401
      if (pathname.startsWith("/api/")) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      // Page routes: redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
