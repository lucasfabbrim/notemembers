"use client"

import { AuthGuard } from "@/components/auth-guard"
import { MobileNav } from "@/components/mobile-nav"
import { DesktopHeader } from "@/components/desktop-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Clock, CheckCircle2, Headphones, Zap, Shield } from "lucide-react"

export default function SupportPage() {
  const whatsappNumber = "5511999999999"
  const whatsappMessage = encodeURIComponent("Olá! Preciso de ajuda com a plataforma Note Members.")

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank")
  }

  const tips = [
    "Descreva seu problema de forma clara e objetiva",
    "Envie prints de tela se possível",
    "Informe seu email cadastrado para identificação",
  ]

  const features = [
    {
      icon: Zap,
      title: "Resposta Rápida",
      description: "Atendimento ágil e eficiente para resolver suas dúvidas",
    },
    {
      icon: Headphones,
      title: "Suporte Dedicado",
      description: "Equipe especializada pronta para ajudar você",
    },
    {
      icon: Shield,
      title: "Sempre Disponível",
      description: "Estamos aqui para garantir sua melhor experiência",
    },
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20 md:pb-8">
        <DesktopHeader />

        <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Suporte via WhatsApp</h1>
            <p className="text-muted-foreground text-lg">
              Entre em contato conosco diretamente pelo WhatsApp para suporte rápido e eficiente
            </p>
          </div>

          <Card className="p-8 space-y-6 text-center bg-zinc-900/50 border-zinc-800">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Fale Conosco</h2>
              <p className="text-muted-foreground">
                Nossa equipe está pronta para ajudar você com qualquer dúvida ou problema
              </p>
            </div>

            <Button
              size="lg"
              className="w-full md:w-auto text-base font-semibold gap-2 bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5" />
              Abrir WhatsApp
            </Button>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <p className="text-sm text-muted-foreground font-semibold">Horário de atendimento:</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-medium">Segunda a Sexta: 9h às 18h</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-medium">Sábado: 9h às 13h</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Por que nosso suporte é diferente?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <Card
                  key={i}
                  className="p-6 space-y-3 bg-zinc-900/50 border-zinc-800 text-center hover:border-purple-500/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Dicas Rápidas</h3>
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-semibold text-purple-500">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
