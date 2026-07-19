import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/zaproszenie", "/api/verify-invite", "/login", "/auth", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sprawdź czy ścieżka jest publiczna
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return await updateSession(request);
  }

  // Sprawdź czy użytkownik ma kod zaproszenia
  const inviteCookie = request.cookies.get("vintera_invite")?.value;
  if (!inviteCookie) {
    return NextResponse.redirect(new URL("/zaproszenie", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};