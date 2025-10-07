import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/perfil", "/categories", "/suporte"]

// Routes that are only for non-authenticated users
const authRoutes = ["/login", "/register"]

// Admin-only routes
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Get user data from cookies to check role
  const userDataCookie = request.cookies.get("user_data")?.value
  let userData = null

  if (userDataCookie) {
    try {
      userData = JSON.parse(userDataCookie)
    } catch (e) {
      // Invalid user data, treat as not authenticated
      userData = null
    }
  }

  const isAuthenticated = !!token
  const isAdmin = userData?.role === "ADMIN"

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is admin-only
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if authenticated user tries to access auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect to dashboard if non-admin tries to access admin routes
  if (isAdminRoute && isAuthenticated && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
}
