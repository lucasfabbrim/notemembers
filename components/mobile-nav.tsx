"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@iconify/react"
import { getUserData } from "@/lib/auth"
import { useEffect, useState } from "react"

export function MobileNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const user = getUserData()
    setIsAdmin(user?.role === "ADMIN")
  }, [])

  const links = [
    { href: "/dashboard", label: "Início", icon: "solar:home-2-linear" },
    { href: "/suporte", label: "Suporte", icon: "solar:chat-round-line-linear" },
    { href: "/perfil", label: "Perfil", icon: "solar:user-circle-linear" },
  ]

  if (isAdmin) {
    links.splice(2, 0, { href: "/admin", label: "Admin", icon: "solar:shield-star-linear" })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-20 px-4 max-w-md mx-auto">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center justify-center gap-1.5 
                flex-1 h-14 rounded-2xl
                transition-all duration-300 ease-out
                ${isActive ? "bg-primary/10" : "hover:bg-muted/50"}
              `}
            >
              <Icon
                icon={link.icon}
                className={`
                  w-6 h-6 transition-all duration-300
                  ${isActive ? "text-primary scale-110" : "text-muted-foreground"}
                `}
              />

              <span
                className={`
                  text-[11px] font-medium transition-all duration-300
                  ${isActive ? "text-primary" : "text-muted-foreground"}
                `}
              >
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
