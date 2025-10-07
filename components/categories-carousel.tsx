import { api } from "@/lib/api"
import { VideoCarousel } from "@/components/video-carousel"
import { Icon } from "@iconify/react"

interface Video {
  id: string
  slug: string
  title: string
  description?: string
  thumbnail?: string
  duration?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export async function CategoriesCarousel() {
  let categories: Category[] = []
  const categoryVideos: Record<string, Video[]> = {}

  try {
    // Fetch all categories
    const categoriesData = await api.categories.getAll()
    const categoriesArray = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData?.data?.categories || categoriesData?.data || []
    categories = categoriesArray

    for (const category of categories) {
      try {
        const response = await api.categories.getVideos(category.slug)
        const videosArray = Array.isArray(response) ? response : response?.data?.videos || response?.videos || []

        if (videosArray.length > 0) {
          categoryVideos[category.slug] = videosArray
        }
      } catch (error: any) {
        console.error(`[v0] Failed to load videos for category ${category.slug}:`, error?.message || error)
        // Don't add empty array - just skip this category entirely
        continue
      }
    }
  } catch (error) {
    console.error("[v0] Error loading categories:", error)
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center mx-auto ring-4 ring-red-600/10">
            <Icon icon="solar:danger-triangle-bold-duotone" className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">Erro ao carregar conteúdo</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            Não foi possível carregar as categorias. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    )
  }

  // Filter categories that have videos
  const categoriesWithVideos = categories.filter((category) => categoryVideos[category.slug]?.length > 0)

  if (categoriesWithVideos.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-900/20 flex items-center justify-center mx-auto ring-4 ring-purple-600/10">
            <Icon icon="solar:video-library-bold-duotone" className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">Nenhum conteúdo disponível</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            Estamos preparando conteúdos incríveis para você. Novos vídeos serão adicionados em breve!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16 pt-4 pb-10">
      {categoriesWithVideos.map((category) => {
        const videos = categoryVideos[category.slug] || []

        return (
          <section key={category.id} className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-6">
              <header className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{category.name}</h2>
                  {category.description && (
                    <p className="text-sm md:text-base text-zinc-400 max-w-3xl">{category.description}</p>
                  )}
                </div>
              </header>
            </div>

            <div className="overflow-x-auto md:overflow-hidden pb-4">
              <VideoCarousel
                items={videos.map((video, index) => ({
                  id: video.id,
                  slug: video.slug,
                  title: video.title,
                  thumbnail: video.thumbnail,
                  duration: video.duration,
                  link: `/categories/${category.slug}/video/${video.slug}`,
                  isFirst: index === 0,
                }))}
              />
            </div>
          </section>
        )
      })}
    </div>
  )
}
