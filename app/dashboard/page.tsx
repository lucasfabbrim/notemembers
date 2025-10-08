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

      <main className="py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-6 lg:px-8 mb-6 md:mb-8">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 p-6 md:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl lg:text-2xl max-w-lg font-semibold text-white leading-tight">
                  Transforme sua vida com organização e produtividade com nossos planners!
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 md:px-6 lg:px-8 mb-8 md:mb-12">
          <Card className="bg-zinc-900/50 border-zinc-800 p-4 md:p-6 lg:p-8">
            <div className="flex gap-3 md:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Icon icon="solar:notebook-bold" className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-500" />
                </div>
              </div>

              <div className="space-y-2 md:space-y-4 flex-1">
                <div>
                  <h3 className="text-base md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2">
                    Baixe seu Planner de Organização
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-400">Comece a organizar sua rotina agora mesmo</p>
                </div>

                <p className="text-xs md:text-sm lg:text-base text-zinc-300 leading-relaxed">
                  Acesse nosso planner exclusivo no Notion e transforme a forma como você gerencia seu tempo e tarefas.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-1 md:pt-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white transition-colors md:h-10"
                  >
                    <a
                      href="https://notion.so"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                      <Icon icon="simple-icons:notion" className="w-4 h-4 md:w-5 md:h-5" />
                      Ir para o Notion
                    </a>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 hover:bg-purple-500/10 text-white transition-colors bg-transparent md:h-10"
                  >
                    <Link
                      href="/planner-tutorial"
                      className="flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                      <Icon icon="solar:play-circle-bold" className="w-4 h-4 md:w-5 md:h-5" />
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
