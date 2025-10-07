import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Lock, Clock } from "lucide-react"
import Link from "next/link"

interface VideoCardProps {
  video: {
    id: string
    title: string
    description?: string
    thumbnail?: string
    duration?: string
    isPremium?: boolean
  }
  categoryId: string
  isLocked?: boolean
}

export function VideoCard({ video, categoryId, isLocked = false }: VideoCardProps) {
  return (
    <Link
      href={isLocked ? "#" : `/categories/${categoryId}/video/${video.id}`}
      className={isLocked ? "cursor-not-allowed" : ""}
    >
      <Card
        className={`group relative overflow-hidden h-64 transition-all ${
          isLocked ? "opacity-60" : "hover:ring-2 hover:ring-primary cursor-pointer"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img
          src={video.thumbnail || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(video.title)}`}
          alt={video.title}
          className={`absolute inset-0 w-full h-full object-cover ${!isLocked && "group-hover:scale-105"} transition-transform duration-300`}
        />

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Conteúdo Premium</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {!isLocked && (
              <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
            )}
            {video.duration && (
              <Badge variant="secondary" className="bg-background/80">
                <Clock className="w-3 h-3 mr-1" />
                {video.duration}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-balance">{video.title}</h3>
          {video.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{video.description}</p>
          )}
        </div>
      </Card>
    </Link>
  )
}
