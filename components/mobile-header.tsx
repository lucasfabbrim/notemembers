"use client"

import { Logo } from "@/components/logo"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border md:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <Logo />
      </div>
    </header>
  )
}
