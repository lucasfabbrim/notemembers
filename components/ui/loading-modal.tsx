"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

interface LoadingModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  status: "loading" | "success" | "error"
  message?: string
  errorMessage?: string
  successMessage?: string
}

export function LoadingModal({
  open,
  onOpenChange,
  status,
  message = "Processando...",
  errorMessage = "Ocorreu um erro",
  successMessage = "Concluído com sucesso!",
}: LoadingModalProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === "loading" && open) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev
          const increment = Math.random() * 15
          return Math.min(prev + increment, 95)
        })
      }, 500)

      return () => clearInterval(interval)
    } else if (status === "success" || status === "error") {
      setProgress(100)
    }
  }, [status, open])

  const getProgressColor = () => {
    if (status === "error") return "bg-red-500"
    if (status === "success") return "bg-green-500"
    if (progress < 30) return "bg-blue-500"
    if (progress < 60) return "bg-purple-500"
    if (progress < 90) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={status !== "loading"}>
        <DialogTitle className="sr-only">
          {status === "loading" ? message : status === "success" ? successMessage : "Erro"}
        </DialogTitle>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {status === "loading" && (
            <>
              <div className="relative">
                <Icon icon="svg-spinners:ring-resize" className="w-16 h-16 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">{message}</h3>
                <p className="text-sm text-muted-foreground">Aguarde enquanto processamos sua solicitação</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icon icon="solar:check-circle-bold" className="w-10 h-10 text-green-500 animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-green-500">{successMessage}</h3>
                <p className="text-sm text-muted-foreground">Operação concluída com sucesso!</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-shake">
                  <Icon icon="solar:close-circle-bold" className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-500">Erro</h3>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </>
          )}

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500 ease-out", getProgressColor())}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
