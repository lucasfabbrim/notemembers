"use client"

function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof window !== "undefined") {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure;HttpOnly`
  }
}

function deleteCookie(name: string) {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    // Store in localStorage for client-side access
    localStorage.setItem("auth_token", token)

    const userData = decodeJWT(token)
    if (userData) {
      localStorage.setItem("user_data", JSON.stringify(userData))
    }

    setCookie("auth_token", token, 7)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    // Remove from localStorage
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")

    deleteCookie("auth_token")
  }
}

export function setUserData(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user))
  }
}

export function getUserData(): any | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("user_data")
    return data ? JSON.parse(data) : null
  }
  return null
}
