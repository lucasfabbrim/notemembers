"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { MobileNav } from "@/components/mobile-nav"
import { MobileHeader } from "@/components/mobile-header"
import { DesktopHeader } from "@/components/desktop-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon } from "@iconify/react"
import { getAuthToken, getUserData } from "@/lib/auth"
import { api } from "@/lib/api"
import { ActionButton } from "@/components/ui/action-button"
import { useButtonCooldown } from "@/hooks/use-button-cooldown"
import Link from "next/link"

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

    if (token && params.id && params.videoId) {
      try {
        const videoData = await api.categories.getVideo(params.id as string, params.videoId as string, token)
        setVideo(videoData.data.video)
        setLikeCount(videoData.data.video?.likes || 0)

        const categoryData = await api.categories.getVideos(params.id as string, token)
        setCategoryVideos(categoryData.data.videos || [])
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
    })
  }

  const currentIndex = categoryVideos.findIndex((v) => v.slug === params.videoId)
  const prevVideo = currentIndex > 0 ? categoryVideos[currentIndex - 1] : null
  const nextVideo = currentIndex < categoryVideos.length - 1 ? categoryVideos[currentIndex + 1] : null

  const hasAccess = true

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 md:pb-8 bg-black">
        <MobileHeader />
        <DesktopHeader />

        <main className="py-6 md:py-8">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ) : video ? (
              <>
                <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-white transition-colors">
                  <Link href={`/categories/${params.id}`} className="flex items-center gap-2">
                    <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
                    Voltar à Categoria
                  </Link>
                </Button>

                <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                  {/* Video player area */}
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
                    {hasAccess ? (
                      video.url ? (
                        (() => {
                          // Check if it's a YouTube URL
                          const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be')
                          
                          if (isYouTube) {
                            // Extract video ID from YouTube URL
                            let videoId = ''
                            if (video.url.includes('youtube.com/watch?v=')) {
                              videoId = video.url.split('v=')[1]?.split('&')[0] || ''
                            } else if (video.url.includes('youtu.be/')) {
                              videoId = video.url.split('youtu.be/')[1]?.split('?')[0] || ''
                            }
                            
                            if (videoId) {
                              return (
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title={video.title}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              )
                            }
                          }
                          
                          return (
                            <video controls className="w-full h-full" poster={video.thumbnail}>
                              <source src={video.url} type="video/mp4" />
                              Seu navegador não suporta o elemento de vídeo.
                            </video>
                          )
                        })()
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent" />
                          <div className="relative z-10 text-center space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Icon icon="solar:play-circle-bold" className="w-12 h-12 text-purple-500" />
                            </div>
                            <p className="text-zinc-400 text-sm">Vídeo em processamento</p>
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent" />
                        <div className="relative z-10 text-center space-y-4 p-8">
                          <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Icon icon="solar:lock-keyhole-bold" className="w-12 h-12 text-purple-500" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xl font-semibold text-white">Conteúdo Premium</p>
                            <p className="text-sm text-zinc-400">Faça upgrade para MEMBER para assistir</p>
                          </div>
                          <Button
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                            onClick={() => router.push("/perfil")}
                          >
                            <Icon icon="solar:star-bold" className="w-5 h-5 mr-2" />
                            Fazer Upgrade
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                    {/* Title and description */}
                    <div className="space-y-2 md:space-y-3">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{video.title}</h1>
                      {video.description && (
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{video.description}</p>
                      )}
                    </div>

                    {video.creator && (
                      <div className="flex items-center gap-3 pt-3 md:pt-4 border-t border-zinc-800">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="solar:user-bold" className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm md:text-base">{video.creator}</p>
                          <p className="text-zinc-400 text-xs md:text-sm">Criador de Conteúdo</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-4">
                      {video.createdAt && (
                        <div className="flex items-center gap-2 md:gap-3 text-sm">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:calendar-bold" className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-zinc-400 text-xs">Publicado</p>
                            <p className="text-white font-medium text-sm">
                              {new Date(video.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {video.topics && video.topics.length > 0 && (
                      <div className="pt-4 md:pt-6 border-t border-zinc-800 space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-white">O que você vai aprender:</h3>
                        <ul className="space-y-2 md:space-y-3">
                          {video.topics.map((topic: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 md:gap-3 text-zinc-300 text-xs md:text-sm"
                            >
                              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="w-3 h-3 md:w-4 md:h-4 text-purple-500"
                                />
                              </div>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(prevVideo || nextVideo) && (
                      <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-zinc-800">
                        <ActionButton
                          buttonId="prev-button"
                          variant="outline"
                          onClick={() => prevVideo && router.push(`/categories/${params.id}/video/${prevVideo.slug}`)}
                          disabled={!prevVideo}
                          cooldownSeconds={2}
                          className="border-zinc-700 hover:bg-zinc-800 text-white transition-colors bg-transparent flex-1 text-sm md:text-base"
                        >
                          <Icon icon="solar:arrow-left-linear" className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Anterior
                        </ActionButton>
                        <ActionButton
                          buttonId="next-button"
                          variant="outline"
                          onClick={() => nextVideo && router.push(`/categories/${params.id}/video/${nextVideo.slug}`)}
                          disabled={!nextVideo}
                          cooldownSeconds={2}
                          className="border-zinc-700 hover:bg-zinc-800 text-white transition-colors bg-transparent flex-1 text-sm md:text-base"
                        >
                          Próximo
                          <Icon icon="solar:arrow-right-linear" className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                        </ActionButton>
                      </div>
                    )}
                  </div>
                </Card>

                {categoryVideos.length > 1 && (
                  <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                    <h2 className="text-lg md:text-xl font-semibold text-white px-2">Mais vídeos desta categoria</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {categoryVideos
                        .filter((v) => v.slug !== params.videoId)
                        .slice(0, 4)
                        .map((related: any) => (
                          <Card
                            key={related.slug}
                            className="bg-zinc-900/50 border-zinc-800 overflow-hidden cursor-pointer hover:bg-zinc-900 transition-colors"
                            onClick={() => router.push(`/categories/${params.id}/video/${related.slug}`)}
                          >
                            <div className="aspect-video relative overflow-hidden bg-zinc-800">
                              {related.thumbnail ? (
                                <img
                                  src={related.thumbnail || "/placeholder.svg"}
                                  alt={related.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon
                                    icon="solar:video-frame-bold"
                                    className="w-10 h-10 md:w-12 md:h-12 text-zinc-600"
                                  />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/80 flex items-center justify-center">
                                  <Icon icon="solar:play-bold" className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div className="p-3 md:p-4 space-y-1.5 md:space-y-2">
                              <h3 className="font-medium text-white line-clamp-2 text-xs md:text-sm">
                                {related.title}
                              </h3>
                              {/* Removed duration display from related videos */}
                              {/* {related.duration && (
                                <div className="flex items-center gap-1 md:gap-1.5 text-xs text-zinc-400">
                                  <Icon icon="solar:clock-circle-bold" className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                  {related.duration}
                                </div>
                              )} */}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800 p-8 md:p-16 text-center space-y-4">
                <Icon icon="solar:video-frame-cut-bold" className="w-16 h-16 mx-auto text-zinc-600" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Vídeo não encontrado</h3>
                  <p className="text-zinc-400">Este vídeo pode ter sido removido ou não existe</p>
                </div>
                <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700">
                  <Icon icon="solar:arrow-left-linear" className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Card>
            )}
          </div>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
