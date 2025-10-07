"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { MobileNav } from "@/components/mobile-nav"
import { MobileHeader } from "@/components/mobile-header"
import { DesktopHeader } from "@/components/desktop-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import { getAuthToken, getUserData, removeAuthToken } from "@/lib/auth"
import { api } from "@/lib/api"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  externalId: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = getUserData()
        const token = getAuthToken()

        console.log("[v0] Loading profile data")
        console.log("[v0] User data from storage:", userData)
        console.log("[v0] Token exists:", !!token)

        if (!token) {
          console.log("[v0] No token found, redirecting to login")
          setError("Sessão expirada. Faça login novamente.")
          setLoading(false)
          return
        }

        if (userData) {
          console.log("[v0] Setting user data:", userData)
          setUser(userData)
        } else {
          console.log("[v0] No user data in storage")
        }

        try {
          console.log("[v0] Fetching purchases from API...")
          const purchasesResponse = await api.customers.getPurchases(token)
          console.log("[v0] Raw purchases response:", purchasesResponse)

          // Handle different response structures
          let purchasesData: any[] = []

          if (Array.isArray(purchasesResponse)) {
            purchasesData = purchasesResponse
          } else if (purchasesResponse?.data) {
            if (Array.isArray(purchasesResponse.data)) {
              purchasesData = purchasesResponse.data
            } else if (purchasesResponse.data.purchases && Array.isArray(purchasesResponse.data.purchases)) {
              purchasesData = purchasesResponse.data.purchases
            }
          }

          console.log("[v0] Parsed purchases data:", purchasesData)
          console.log("[v0] Number of purchases:", purchasesData.length)

          setPurchases(purchasesData)
        } catch (purchaseError: any) {
          console.error("[v0] Error loading purchases:", purchaseError)
          console.error("[v0] Error message:", purchaseError.message)
          console.error("[v0] Error stack:", purchaseError.stack)

          // Don't set error state for purchases - just log it
          // User info is more important
          setPurchases([])
        }
      } catch (error: any) {
        console.error("[v0] Error loading profile data:", error)
        console.error("[v0] Error message:", error.message)
        setError("Erro ao carregar dados do perfil. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    const token = getAuthToken()
    if (token) {
      try {
        await api.auth.logout(token)
      } catch (error) {
        console.error("[v0] Erro ao fazer logout:", error)
      }
    }
    removeAuthToken()
    router.push("/login")
  }

  const isMember = user?.role === "MEMBER" || user?.role === "ADMIN"

  const ownedProducts = purchases
    .flatMap((p) => p.products || [])
    .filter((product: Product, index: number, self: Product[]) => self.findIndex((p) => p.id === product.id) === index)

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen pb-20 md:pb-8 bg-black">
          <MobileHeader />
          <DesktopHeader />
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="p-12 md:p-16 text-center space-y-6 bg-zinc-900/50 border-zinc-800 backdrop-blur">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center mx-auto ring-4 ring-red-600/10">
                <Icon icon="solar:shield-warning-bold-duotone" className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Erro ao carregar perfil</h3>
                <p className="text-base md:text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">{error}</p>
              </div>
              <Button onClick={() => router.push("/login")} className="bg-purple-600 hover:bg-purple-700">
                <Icon icon="solar:login-3-bold" className="w-5 h-5 mr-2" />
                Fazer Login
              </Button>
            </Card>
          </main>
          <MobileNav />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 md:pb-8 bg-black">
        <MobileHeader />
        <DesktopHeader />

        <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
          {/* Profile Header */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Meu Perfil</h1>
          </div>

          {/* Profile Info */}
          <Card className="p-6 space-y-6 bg-zinc-900/50 border-zinc-800">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-64" />
                    <div className="h-4 bg-muted rounded w-56" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-900/20 flex items-center justify-center flex-shrink-0 ring-4 ring-purple-600/10">
                  <Icon icon="solar:user-bold-duotone" className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{user?.name || "Usuário"}</h2>
                    <Badge
                      variant={isMember ? "default" : "secondary"}
                      className={isMember ? "bg-purple-600 hover:bg-purple-600" : ""}
                    >
                      {user?.role || "FREE"}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:letter-bold-duotone" className="w-4 h-4" />
                      <span>{user?.email || "Email não disponível"}</span>
                    </div>
                    {user?.createdAt && (
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:calendar-bold-duotone" className="w-4 h-4" />
                        <span>Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {!loading && ownedProducts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
                <Icon icon="solar:box-bold-duotone" className="w-6 h-6 text-purple-500" />
                Meus Produtos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ownedProducts.map((product: Product) => (
                  <Card key={product.id} className="p-4 flex items-center gap-3 bg-zinc-900/50 border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon icon="solar:box-bold" className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-white">{product.name}</p>
                      <p className="text-xs text-zinc-400">Acesso completo</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Purchases */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
              <Icon icon="solar:bag-4-bold-duotone" className="w-6 h-6 text-purple-500" />
              Histórico de Compras
            </h2>

            {loading ? (
              <Card className="p-6 animate-pulse bg-zinc-900/50 border-zinc-800">
                <div className="h-20 bg-zinc-800 rounded" />
              </Card>
            ) : purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.map((purchase, index) => (
                  <Card key={index} className="p-4 bg-zinc-900/50 border-zinc-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{purchase.customerName || "Compra"}</h3>
                          <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                            {purchase.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(purchase.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {purchase.products && purchase.products.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {purchase.products.map((product: Product) => (
                              <Badge key={product.id} variant="outline" className="text-xs">
                                {product.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(purchase.amount / 100)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 md:p-16 text-center space-y-6 bg-zinc-900/50 border-zinc-800 backdrop-blur">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-900/20 flex items-center justify-center mx-auto ring-4 ring-purple-600/10">
                  <Icon icon="solar:bag-smile-bold-duotone" className="w-10 h-10 md:w-12 md:h-12 text-purple-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Nenhuma compra ainda</h3>
                  <p className="text-base md:text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Quando você realizar uma compra, ela aparecerá aqui com todos os detalhes
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full bg-transparent border-zinc-800 hover:bg-zinc-900 text-white"
          >
            <Icon icon="solar:logout-2-bold" className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
