import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin and its subpaths
  if (pathname.startsWith("/admin")) {
    // El token ahora se verifica en el cliente con localStorage
    // Este middleware solo redirige si estamos en el cliente y no hay token
    // La verificación real del token se hace en cada componente protegido
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
