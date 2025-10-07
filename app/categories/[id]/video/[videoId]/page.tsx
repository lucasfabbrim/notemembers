"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { DesktopHeader } from "@/components/desktop-header"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Calendar, ThumbsUp, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { getAuthToken, getUserData } from "@/lib/auth"
import { api } from "@/lib/api"
import { ActionButton } from "@/components/ui/action-button"
import { useButtonCooldown } from "@/hooks/use-button-cooldown"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [video, setVideo] = useState<any>(null)
  const [categoryVideos, setCategoryVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const { startCooldown } = useButtonCooldown("video-page")

  useEffect(() => {
    loadData()
  }, [params.id, params.videoId])

  const loadData = async () => {
    setLoading(true)
    const userData = getUserData()
    const token = getAuthToken()

    if (userData) {
      setUser(userData)
    }

    if (params.id && params.videoId) {
      try {
        // Load video details - try without token first
        const videoData = await api.categories.getVideo(params.id as string, params.videoId as string)
        console.log("Video data response:", videoData)
        
        if (videoData?.data?.video) {
          setVideo(videoData.data.video)
          setLikeCount(videoData.data.video?.likes || 0)
        }

        // Load all videos from category for prev/next navigation
        const categoryData = await api.categories.getVideos(params.id as string)
        setCategoryVideos(categoryData?.data?.videos || [])
      } catch (error) {
        console.error("Erro ao carregar vídeo:", error)
      }
    }

    setLoading(false)
  }

  const handleLike = async () => {
    await startCooldown(async () => {
      setLiked(!liked)
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
      // TODO: Call API to save like
    })
  }

  const handleShare = async () => {
    await startCooldown(async () => {
      if (navigator.share) {
        await navigator.share({
          title: video?.title,
          text: video?.description,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copiado!")
      }
    })
  }

  const currentIndex = categoryVideos.findIndex((v) => v.id === params.videoId)
  const prevVideo = currentIndex > 0 ? categoryVideos[currentIndex - 1] : null
  const nextVideo = currentIndex < categoryVideos.length - 1 ? categoryVideos[currentIndex + 1] : null

  const isMember = true // Always true for testing
  const hasAccess = true // Always true for testing

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 md:pb-8 bg-background">
        <DesktopHeader />

        <main className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          ) : video ? (
            <>
              {/* Video Player */}
              <div className="space-y-4">
                {hasAccess ? (
                  <Card className="aspect-video bg-black overflow-hidden">
                    {video.url ? (
                      <video controls className="w-full h-full" poster={video.thumbnail}>
                        <source src={video.url} type="video/mp4" />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-2">
                          <p>Vídeo em processamento</p>
                          <p className="text-sm">Em breve disponível</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Conteúdo Premium</h2>
                      <p className="text-muted-foreground text-lg">Faça upgrade para MEMBER para assistir este vídeo</p>
                      <Button size="lg" className="text-base font-semibold" onClick={() => router.push("/perfil")}>
                        Fazer Upgrade Agora
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Video Actions */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => prevVideo && router.push(`/categories/${params.id}/video/${prevVideo.id}`)}
                      disabled={!prevVideo}
                      cooldownSeconds={2}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </ActionButton>
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => nextVideo && router.push(`/categories/${params.id}/video/${nextVideo.id}`)}
                      disabled={!nextVideo}
                      cooldownSeconds={2}
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </ActionButton>
                  </div>

                  <div className="flex items-center gap-2">
                    <ActionButton
                      variant={liked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLike}
                      cooldownSeconds={3}
                    >
                      <ThumbsUp className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                      {likeCount}
                    </ActionButton>
                    <ActionButton variant="outline" size="sm" onClick={handleShare} cooldownSeconds={2}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </ActionButton>
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2 flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">{video.title}</h1>
                      <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                        {video.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{video.duration}</span>
                          </div>
                        )}
                        {video.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(video.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {video.description && (
                    <Card className="p-6">
                      <h2 className="text-lg font-semibold mb-3">Sobre este vídeo</h2>
                      <p className="text-muted-foreground leading-relaxed text-pretty">{video.description}</p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Related Videos */}
              {categoryVideos.length > 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight">Mais vídeos desta categoria</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryVideos
                      .filter((v) => v.id !== params.videoId)
                      .slice(0, 6)
                      .map((related: any) => (
                        <Card
                          key={related.id}
                          className="group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => router.push(`/categories/${params.id}/video/${related.id}`)}
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={
                                related.thumbnail ||
                                `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(related.title) || "/placeholder.svg"}`
                              }
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-semibold line-clamp-2 text-balance">{related.title}</h3>
                            {related.duration && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {related.duration}
                              </p>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12 text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Vídeo não encontrado</h3>
                <p className="text-muted-foreground">Este vídeo pode ter sido removido ou não existe</p>
              </div>
              <Button onClick={() => router.back()}>Voltar</Button>
            </Card>
          )}
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
