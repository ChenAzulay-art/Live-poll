import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { voterCookie } from "@/lib/auth/cookie-config";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get(voterCookie.name)) {
    response.cookies.set(
      voterCookie.name,
      crypto.randomUUID(),
      voterCookie.options,
    );
  }
  return response;
}

export const config = {
  matcher: ["/vote/:path*", "/"],
};
