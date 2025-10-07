"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { setAuthToken } from "@/lib/auth"
import { z } from "zod"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [shake, setShake] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})
    if (isLoading) return

    const validation = loginSchema.safeParse({ email, password })

    if (!validation.success) {
      const errors: { email?: string; password?: string } = {}
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") errors.email = err.message
        if (err.path[0] === "password") errors.password = err.message
      })
      setFieldErrors(errors)
      setShake(true)
      setTimeout(() => setShake(false), 650)
      return
    }

    setIsLoading(true)

    const performLogin = async () => {
      const response = await api.auth.login({ email, password })

      if (!response.success || !response.data?.token) {
        throw new Error("Resposta inválida do servidor")
      }

      const token = response.data.token
      setAuthToken(token)

      const savedUser = localStorage.getItem("user_data")
      const userData = savedUser ? JSON.parse(savedUser) : null
      const redirectPath = userData?.role === "ADMIN" ? "/admin" : "/dashboard"

      window.location.href = redirectPath
    }

    try {
      await performLogin()
    } catch (err: any) {
      let errorMessage = "Erro ao fazer login. Tente novamente."

      if (err.message) {
        if (err.message.includes("Invalid credentials") || err.message.includes("Authentication failed")) {
          errorMessage = "Email ou senha incorretos"
        } else if (err.message.includes("Network") || err.message.includes("fetch")) {
          errorMessage = "Erro de conexão. Verifique sua internet"
        } else if (err.message.includes("Resposta inválida")) {
          errorMessage = "Erro no servidor. Tente novamente mais tarde"
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      setShake(true)
      setTimeout(() => setShake(false), 650)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-6">
          <Logo />
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Entre para acessar seu conteúdo exclusivo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={cn("space-y-6", shake && "animate-shake")}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  required
                  className={cn(
                    "h-11 pl-10 transition-colors",
                    fieldErrors.email && "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </div>
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  required
                  className={cn(
                    "h-11 pl-10 pr-10 transition-colors",
                    fieldErrors.password && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full h-11">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <Link href="/register" className="text-primary hover:underline font-medium">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  )
}
