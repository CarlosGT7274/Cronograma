
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Obtener la cookie de sesión o token
  const session = request.cookies.get("session")

  // Si estamos en /login y hay sesión, redirigir a /
  if (request.nextUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si no estamos en /login y no hay sesión, redirigir a /login
  if (request.nextUrl.pathname !== "/login" && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


