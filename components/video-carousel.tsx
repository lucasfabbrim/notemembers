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
        <CarouselContent className="-ml-2 md:-ml-3">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-2 md:pl-3 basis-[45%] sm:basis-[30%] md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <Link href={item.link}>
                <div
                  className="relative overflow-hidden transition-all duration-300 bg-zinc-900 transform-gpu rounded-md"
                  role="article"
                  aria-label={item.title}
                >
                  <div className="aspect-[2/3] relative transition-all">
                    {/* Badge for first video */}
                    {item.isFirst && (
                      <Badge className="absolute top-1.5 left-1.5 z-10 bg-purple-600 hover:bg-purple-600 text-white border-0 font-bold px-2 py-0.5 text-[10px] md:text-xs shadow-lg">
                        <Icon icon="solar:star-bold" className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                        Popular
                      </Badge>
                    )}

                    {/* Duration badge */}
                    {/* Removed duration badge display */}
                    {/* {item.duration && (
                      <Badge className="absolute bottom-1.5 right-1.5 z-10 bg-black/90 text-white border-0 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1">
                        {item.duration}
                      </Badge>
                    )} */}

                    {item.isLoading ? (
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-3 md:p-4 gap-2 md:gap-3 rounded-md">
                        <Skeleton className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-zinc-200" />
                        <div className="text-center space-y-1.5 md:space-y-2 w-full">
                          <Skeleton className="h-3 md:h-4 w-3/4 mx-auto bg-zinc-200" />
                          <Skeleton className="h-2 md:h-3 w-1/2 mx-auto bg-zinc-200" />
                        </div>
                        <p className="text-zinc-400 text-[10px] md:text-xs font-medium mt-1 md:mt-2">Carregando...</p>
                      </div>
                    ) : item.thumbnail ? (
                      <Image
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover rounded-md opacity-90 hover:opacity-100 transition-all"
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-3 md:p-4 gap-2 md:gap-3 rounded-md">
                        <Icon icon="solar:document-text-bold-duotone" className="w-8 h-8 md:w-12 md:h-12 text-black" />
                        <div className="text-center space-y-0.5 md:space-y-1">
                          <h4 className="text-black font-bold text-xs md:text-sm line-clamp-2">{item.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Icon icon="solar:play-circle-bold" className="w-3 h-3 md:w-4 md:h-4 text-black" />
                          <span className="text-black text-[10px] md:text-xs font-semibold">Note Planning</span>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay with play button */}
                    {item.thumbnail && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                          <Icon icon="solar:play-bold" className="w-5 h-5 md:w-6 md:h-6 text-black ml-0.5" />
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
          <CarouselPrevious className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-900/80 text-white border-none hover:bg-zinc-800 shadow-lg" />
        </div>
        <div className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block hidden">
          <CarouselNext className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-zinc-900/80 text-white border-none hover:bg-zinc-800 shadow-lg" />
        </div>
      </Carousel>
    </div>
  )
}
