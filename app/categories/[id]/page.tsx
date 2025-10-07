"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { MobileNav } from "@/components/mobile-nav"
import { DesktopHeader } from "@/components/desktop-header"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import { getAuthToken, getUserData } from "@/lib/auth"
import { api } from "@/lib/api"
import { VideoCard } from "@/components/video-card"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const userData = getUserData()
      const token = getAuthToken()

      console.log("[v0] Category page - Loading data for:", params.id)

      if (userData) {
        setUser(userData)
      }

      if (params.id) {
        try {
          console.log("[v0] Fetching videos for category:", params.id)

          let response
          try {
            // Try without token first (public access)
            response = await api.categories.getVideos(params.id as string)
            console.log("[v0] Videos loaded without token")
          } catch (error) {
            console.log("[v0] Failed without token, trying with token...")
            if (token) {
              response = await api.categories.getVideos(params.id as string, token)
              console.log("[v0] Videos loaded with token")
            } else {
              throw error
            }
          }

          console.log("[v0] Videos response:", response)
          setVideos(response.data?.videos || [])
          setCategory(response.data?.category || null)
        } catch (error: any) {
          console.error("[v0] Erro ao carregar vídeos:", error)
          console.error("[v0] Error details:", {
            message: error.message,
            stack: error.stack,
          })
        }
      }

      setLoading(false)
    }

    loadData()
  }, [params.id])

  const isMember = true // Always true for testing

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 md:pb-8">
        <DesktopHeader />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Category Header */}
          {category && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{category.name}</h1>
              </div>
              {category.description && <p className="text-muted-foreground text-lg">{category.description}</p>}
            </div>
          )}

          {/* Videos Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Vídeos</h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted" />
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => {
                  const isLocked = false
                  return <VideoCard key={video.id} video={video} categoryId={params.id as string} isLocked={isLocked} />
                })}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Nenhum vídeo disponível</h3>
                  <p className="text-muted-foreground">Novos vídeos serão adicionados em breve!</p>
                </div>
              </Card>
            )}
          </div>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
