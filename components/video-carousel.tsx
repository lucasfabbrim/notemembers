import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoItem {
  id: string
  slug: string
  title: string
  thumbnail?: string
  duration?: string
  link: string
  isFirst?: boolean
  isLoading?: boolean
}

interface VideoCarouselProps {
  items: VideoItem[]
}

export function VideoCarousel({ items }: VideoCarouselProps) {
  return (
    <div className="relative group">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 cursor-pointer"
            >
              <Link href={item.link}>
                <div
                  className="relative overflow-hidden transition-all duration-300 bg-zinc-900 transform-gpu rounded-[5px]"
                  role="article"
                  aria-label={item.title}
                >
                  <div className="aspect-[2/3] relative transition-all">
                    {/* Badge for first video */}
                    {item.isFirst && (
                      <Badge className="absolute top-2 left-2 z-10 bg-purple-600 hover:bg-purple-600 text-white border-0 font-bold px-3 py-1.5 text-xs shadow-lg">
                        <Icon icon="solar:star-bold" className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}

                    {/* Duration badge */}
                    {item.duration && (
                      <Badge className="absolute bottom-2 right-2 z-10 bg-black/90 text-white border-0 text-xs px-2.5 py-1">
                        {item.duration}
                      </Badge>
                    )}

                    {item.isLoading ? (
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4 gap-3 rounded-[5px]">
                        <Skeleton className="w-12 h-12 rounded-full bg-zinc-200" />
                        <div className="text-center space-y-2 w-full">
                          <Skeleton className="h-4 w-3/4 mx-auto bg-zinc-200" />
                          <Skeleton className="h-3 w-1/2 mx-auto bg-zinc-200" />
                        </div>
                        <p className="text-zinc-400 text-xs font-medium mt-2">Carregando imagem...</p>
                      </div>
                    ) : item.thumbnail ? (
                      <Image
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover rounded-[5px] opacity-90 hover:opacity-100 transition-all"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-4 gap-3 rounded-[5px]">
                        <Icon icon="solar:document-text-bold-duotone" className="w-12 h-12 text-black" />
                        <div className="text-center space-y-1">
                          <h4 className="text-black font-bold text-sm line-clamp-2">{item.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:play-circle-bold" className="w-4 h-4 text-black" />
                          <span className="text-black text-xs font-semibold">Note Planning</span>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay with play button */}
                    {item.thumbnail && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-[5px]">
                        <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                          <Icon icon="solar:play-bold" className="w-6 h-6 text-black ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block hidden">
          <CarouselPrevious className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-zinc-900/80 text-white border-none hover:bg-zinc-800 shadow-lg" />
        </div>
        <div className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block hidden">
          <CarouselNext className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-zinc-900/80 text-white border-none hover:bg-zinc-800 shadow-lg" />
        </div>
      </Carousel>
    </div>
  )
}
