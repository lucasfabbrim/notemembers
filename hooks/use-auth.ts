"use client"

import { useState, useEffect } from "react"
import { getAuthToken, getUserData } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] useAuth: Loading auth state from localStorage")

    const userData = getUserData()
    const authToken = getAuthToken()

    console.log("[v0] useAuth: User data:", userData)
    console.log("[v0] useAuth: Token exists:", !!authToken)

    setUser(userData)
    setToken(authToken)
    setLoading(false)
  }, [])

  const isMember = user?.role === "MEMBER"
  const isAdmin = user?.role === "ADMIN"
  const isAuthenticated = !!token

  return {
    user,
    token,
    loading,
    isMember,
    isAdmin,
    isAuthenticated,
  }
}
