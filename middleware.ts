import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/perfil", "/categories", "/suporte"]

// Routes that are only for non-authenticated users
const authRoutes = ["/login", "/register"]

// Admin-only routes
const adminRoutes = ["/admin"]

function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8")
    const decoded = JSON.parse(jsonPayload)
    console.log("[v0] Middleware - Decoded JWT payload:", decoded)
    return decoded
  } catch (error) {
    console.error("[v0] Middleware - Error decoding JWT:", error)
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const token = request.cookies.get("auth_token")?.value

  console.log("[v0] Middleware - Path:", pathname)
  console.log("[v0] Middleware - Has token:", !!token)

  let userData = null
  if (token) {
    userData = decodeJWT(token)
    console.log("[v0] Middleware - User data from token:", userData)
    console.log("[v0] Middleware - User role:", userData?.role)
    console.log("[v0] Middleware - User role type:", typeof userData?.role)
    console.log("[v0] Middleware - Role comparison:", userData?.role === "ADMIN")
  }

  // Check if token is valid and not expired
  const isTokenValid = userData && (!userData.exp || userData.exp > Date.now() / 1000)
  const isAuthenticated = !!token && isTokenValid
  const isAdmin = isAuthenticated && (userData?.role === "ADMIN" || userData?.role === "admin")

  console.log("[v0] Middleware - Token valid:", isTokenValid)
  console.log("[v0] Middleware - Token exp:", userData?.exp)
  console.log("[v0] Middleware - Current time:", Date.now() / 1000)
  console.log("[v0] Middleware - Is authenticated:", isAuthenticated)
  console.log("[v0] Middleware - Is admin:", isAdmin)

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is admin-only
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  console.log("[v0] Middleware - Is protected route:", isProtectedRoute)
  console.log("[v0] Middleware - Is auth route:", isAuthRoute)
  console.log("[v0] Middleware - Is admin route:", isAdminRoute)

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    console.log("[v0] Middleware - Redirecting to login (not authenticated)")
    console.log("[v0] Middleware - Protected route:", pathname)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if authenticated user tries to access auth routes
  if (isAuthRoute && isAuthenticated) {
    console.log("[v0] Middleware - Redirecting to dashboard (already authenticated)")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Handle admin routes
  if (isAdminRoute) {
    if (isAuthenticated && isAdmin) {
      console.log("[v0] Middleware - Allowing admin access to admin route")
      return NextResponse.next()
    } else if (isAuthenticated && !isAdmin) {
      console.log("[v0] Middleware - Redirecting non-admin from admin route")
      console.log("[v0] Middleware - User role was:", userData?.role)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      console.log("[v0] Middleware - Redirecting unauthenticated user from admin route")
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  console.log("[v0] Middleware - Allowing access")
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico).*)",
  ],
}
