"use client"

import { useState, useEffect } from "react"
import { getAuthToken, getUserData } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = getUserData()
    const authToken = getAuthToken()

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
