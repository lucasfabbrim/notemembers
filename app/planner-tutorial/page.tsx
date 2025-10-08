import { MobileNav } from "@/components/mobile-nav"
import { MobileHeader } from "@/components/mobile-header"
import { DesktopHeader } from "@/components/desktop-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import Link from "next/link"

export default function PlannerTutorialPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-black">
      <MobileHeader />
      <DesktopHeader />

      <main className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          {/* Back button */}
          <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-white transition-colors">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
              Voltar ao Dashboard
            </Link>
          </Button>

          {/* Video card */}
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            {/* Video thumbnail/player area */}
            <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent" />
              <div className="relative z-10 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Icon icon="solar:play-circle-bold" className="w-12 h-12 text-purple-500" />
                </div>
                <p className="text-zinc-400 text-sm">Vídeo em breve</p>
              </div>
            </div>

            {/* Video info */}
            <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
              {/* Title and description */}
              <div className="space-y-2 md:space-y-3">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Como Baixar e Usar o Planner de Organização
                </h1>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  Aprenda passo a passo como acessar, duplicar e personalizar seu planner no Notion. Este tutorial
                  completo vai te guiar desde o primeiro acesso até as configurações avançadas para maximizar sua
                  produtividade.
                </p>
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-3 pt-3 md:pt-4 border-t border-zinc-800">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:user-bold" className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Lucas Mendes</p>
                  <p className="text-zinc-400 text-xs md:text-sm">Especialista em Produtividade</p>
                </div>
              </div>

              {/* Video details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-4">
                <div className="flex items-center gap-2 md:gap-3 text-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Icon icon="solar:clock-circle-bold" className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">Duração</p>
                    <p className="text-white font-medium text-sm">12:45</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 text-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Icon icon="solar:eye-bold" className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">Visualizações</p>
                    <p className="text-white font-medium text-sm">1.2k</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 text-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Icon icon="solar:calendar-bold" className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">Publicado</p>
                    <p className="text-white font-medium text-sm">Há 2 dias</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4 md:pt-6">
                <Button
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 text-white transition-colors flex-1 text-sm md:text-base"
                >
                  <a
                    href="https://notion.so"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Icon icon="simple-icons:notion" className="w-4 h-4 md:w-5 md:h-5" />
                    Acessar Planner no Notion
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800 text-white transition-colors bg-transparent text-sm md:text-base"
                >
                  <Icon icon="solar:share-bold" className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Compartilhar
                </Button>
              </div>

              {/* What you'll learn */}
              <div className="pt-4 md:pt-6 border-t border-zinc-800 space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-white">O que você vai aprender:</h3>
                <ul className="space-y-2 md:space-y-3">
                  {[
                    "Como acessar e duplicar o template do planner",
                    "Personalizar categorias e tags para sua rotina",
                    "Configurar lembretes e notificações",
                    "Integrar com outras ferramentas de produtividade",
                    "Dicas avançadas para maximizar seu uso",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 md:gap-3 text-zinc-300 text-xs md:text-sm">
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon icon="solar:check-circle-bold" className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
