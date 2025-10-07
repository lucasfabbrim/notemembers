import { MobileNav } from "@/components/mobile-nav"
import { MobileHeader } from "@/components/mobile-header"
import { DesktopHeader } from "@/components/desktop-header"
import { CategoriesCarousel } from "@/components/categories-carousel"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-black">
      <MobileHeader />
      <DesktopHeader />

      <main className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 mb-6">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 md:p-8">
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Icon icon="solar:rocket-bold" className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Parabéns pela sua compra!</h2>
                  <p className="text-sm text-zinc-400">Bem-vindo à sua jornada de produtividade</p>
                </div>

                <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                  Organize seu dia e alcance seus objetivos com estratégias comprovadas. Vamos juntos transformar suas
                  metas em realidade!
                </p>

                <div className="pt-2">
                  <p className="text-base md:text-lg font-semibold text-white">Veja nossos conteúdos agora:</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 mb-12">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 md:p-8">
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Icon icon="solar:notebook-bold" className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Baixe seu Planner de Organização</h3>
                  <p className="text-sm text-zinc-400">Comece a organizar sua rotina agora mesmo</p>
                </div>

                <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                  Acesse nosso planner exclusivo no Notion e transforme a forma como você gerencia seu tempo e tarefas.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                    <a
                      href="https://notion.so"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <Icon icon="simple-icons:notion" className="w-5 h-5" />
                      Ir para o Notion
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="border-purple-500/30 hover:bg-purple-500/10 text-white transition-colors bg-transparent"
                  >
                    <Link href="/planner-tutorial" className="flex items-center justify-center gap-2">
                      <Icon icon="solar:play-circle-bold" className="w-5 h-5" />
                      Ver Tutorial em Vídeo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <CategoriesCarousel />
        </Suspense>
      </main>

      <MobileNav />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-16">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="h-8 md:h-10 w-48 md:w-64 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 md:h-5 w-full max-w-2xl bg-zinc-800 animate-pulse rounded mt-3" />
          </div>
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex gap-4 md:gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <Card
                  key={j}
                  className="min-w-[140px] md:min-w-[180px] lg:min-w-[200px] aspect-[2/3] animate-pulse bg-zinc-800 border-zinc-800 rounded-[5px]"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
