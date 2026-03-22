import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // No auth middleware needed — single-user dashboard with service_role key.
  // This middleware is kept as a hook for future auth if needed.
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
