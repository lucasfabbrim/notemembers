"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { ActionButton } from "@/components/ui/action-button"
import { api } from "@/lib/api"
import { setAuthToken, setUserData } from "@/lib/auth"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { AlertCircle, User, Mail, Lock, Eye, EyeOff } from "lucide-react"

const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  email: z.string().email("Email inválido. Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
})

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [shake, setShake] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    const validation = registerSchema.safeParse({ name, email, password })

    if (!validation.success) {
      const errors: { name?: string; email?: string; password?: string } = {}
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "name") errors.name = err.message
        if (err.path[0] === "email") errors.email = err.message
        if (err.path[0] === "password") errors.password = err.message
      })
      setFieldErrors(errors)
      setShake(true)
      setTimeout(() => setShake(false), 650)
      return
    }

    const performRegister = async () => {
      const response: any = await api.auth.register({ name, email, password })
      if (response.token) {
        setAuthToken(response.token)
        setUserData(response.user)
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }

    try {
      await performRegister()
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta")
      setShake(true)
      setTimeout(() => setShake(false), 650)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-6">
          <Logo />
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Criar sua conta</h1>
            <p className="text-muted-foreground">Comece sua jornada de aprendizado hoje</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={cn("space-y-6", shake && "animate-shake")}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: undefined }))
                    }
                  }}
                  required
                  className={cn("h-12 pl-10 transition-colors", fieldErrors.name && "border-destructive")}
                />
              </div>
              {fieldErrors.name && (
                <div className="flex items-center gap-2 text-sm text-destructive animate-slide-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fieldErrors.name}</span>
                </div>
              )}
            </div>

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
                  className={cn("h-12 pl-10 transition-colors", fieldErrors.email && "border-destructive")}
                />
              </div>
              {fieldErrors.email && (
                <div className="flex items-center gap-2 text-sm text-destructive animate-slide-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
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
                  minLength={6}
                  className={cn("h-12 pl-10 pr-10 transition-colors", fieldErrors.password && "border-destructive")}
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
              {fieldErrors.password && (
                <div className="flex items-center gap-2 text-sm text-destructive animate-slide-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg animate-slide-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <ActionButton
            type="submit"
            buttonId="register-submit"
            cooldownDuration={3}
            loadingText="Criando conta..."
            className="w-full h-12 text-base font-semibold"
          >
            Criar conta
          </ActionButton>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Já tem uma conta? </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  )
}
