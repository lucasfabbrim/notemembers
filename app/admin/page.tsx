"use client"

import { useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"
import { removeAuthToken } from "@/lib/auth"
import { CategoriesManager } from "@/components/admin/categories-manager"
import { VideosManager } from "@/components/admin/videos-manager"
import { UsersManager } from "@/components/admin/users-manager"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogout = () => {
    removeAuthToken()
    router.push("/login")
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium text-purple-500">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGoToDashboard} className="gap-2 bg-transparent">
              <Icon icon="solar:home-2-bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <Icon icon="solar:logout-2-bold" className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground text-lg">Gerencie categorias, vídeos e usuários da plataforma</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="dashboard" className="gap-2">
                <Icon icon="solar:chart-2-bold" className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Icon icon="solar:folder-bold" className="w-4 h-4" />
                <span className="hidden sm:inline">Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Icon icon="solar:videocamera-bold" className="w-4 h-4" />
                <span className="hidden sm:inline">Vídeos</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <CategoriesManager />
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <VideosManager />
            </TabsContent>


            <TabsContent value="users" className="space-y-4">
              <UsersManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
