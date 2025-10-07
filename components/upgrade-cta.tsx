import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, Sparkles } from "lucide-react"

interface UpgradeCTAProps {
  title?: string
  description?: string
  compact?: boolean
}

export function UpgradeCTA({
  title = "Desbloqueie Todo o Conteúdo",
  description = "Faça upgrade para MEMBER e tenha acesso ilimitado a todos os cursos, templates e conteúdos exclusivos",
  compact = false,
}: UpgradeCTAProps) {
  if (compact) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button className="flex-shrink-0">Upgrade</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">{title}</h2>
        <p className="text-muted-foreground text-lg text-pretty">{description}</p>
        <Button size="lg" className="text-base font-semibold">
          Fazer Upgrade Agora
        </Button>
      </div>
    </Card>
  )
}
