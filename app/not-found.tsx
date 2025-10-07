"use client"

import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Number with gradient */}
        <div className="relative">
          <h1 className="text-[180px] md:text-[240px] font-bold leading-none bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-br from-purple-500 to-purple-700" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Página não encontrada</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Ops! A página que você está procurando não existe ou foi movida para outro lugar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button onClick={() => router.back()} variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Home className="h-5 w-5" />
              Ir para o Início
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full gap-2 bg-transparent">
              <Search className="h-5 w-5" />
              Explorar Categorias
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="pt-8 opacity-50">
          <p className="text-sm text-muted-foreground">
            Sugestões: Verifique se o URL está correto ou use a busca para encontrar o que procura.
          </p>
        </div>
      </div>
    </div>
  )
}
