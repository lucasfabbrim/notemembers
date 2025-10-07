import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"
import Link from "next/link"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    description?: string
    thumbnail?: string
    isPremium?: boolean
  }
  showLock?: boolean
}

export function CategoryCard({ category, showLock = false }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <Card className="group relative overflow-hidden h-64 hover:ring-2 hover:ring-primary transition-all cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <img
          src={category.thumbnail || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(category.name)}`}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-2">
          {showLock && category.isPremium && (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          <h3 className="text-xl font-bold text-balance">{category.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{category.description}</p>
        </div>
      </Card>
    </Link>
  )
}
