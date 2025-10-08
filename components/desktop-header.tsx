"use client"

import { useRouter, usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icon } from "@iconify/react"
import { getAuthToken, getUserData, removeAuthToken } from "@/lib/auth"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"

export function DesktopHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = getUserData()
    if (userData) {
      setUser(userData)
    }
  }, [])

  const handleLogout = async () => {
    const token = getAuthToken()
    if (token) {
      try {
        await api.auth.logout(token)
      } catch (error) {
        console.error("Erro ao fazer logout:", error)
      }
    }
    removeAuthToken()
    router.push("/login")
  }

  const navItems = [
    { label: "Início", href: "/dashboard", icon: "lucide:home" },
    { label: "Suporte", href: "/suporte", icon: "lucide:message-circle" },
  ]

  if (user?.role === "ADMIN") {
    navItems.push({ label: "Admin", href: "/admin", icon: "lucide:shield" })
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className="gap-2"
                >
                  <Icon icon={item.icon} className="w-4 h-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-accent">
                        <Avatar className="h-10 w-10 border-2 border-accent">
                          <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="hidden md:block">
                    <p className="text-xs">Editar Perfil / Logout</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/perfil")} className="cursor-pointer">
                    <Icon icon="lucide:user" className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          )}
        </div>
      </div>
    </header>
  )
}
