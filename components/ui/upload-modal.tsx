"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Upload, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  status: "uploading" | "success" | "error" | "idle"
  progress: number
  error?: string
  onRetry?: () => void
}

export function UploadModal({ isOpen, onClose, status, progress, error, onRetry }: UploadModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (status === "success") {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return (
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
            <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        )
      case "success":
        return (
          <div className="relative animate-in zoom-in-50 duration-500">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
          </div>
        )
      case "error":
        return (
          <div className="animate-in shake duration-500">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
        )
      default:
        return <Upload className="w-16 h-16 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return "Enviando thumbnail..."
      case "success":
        return "Upload concluído!"
      case "error":
        return "Falha no upload"
      default:
        return "Preparando upload..."
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case "uploading":
        return "Por favor, aguarde enquanto processamos seu arquivo"
      case "success":
        return "Sua thumbnail foi enviada com sucesso"
      case "error":
        return error || "Ocorreu um erro durante o upload"
      default:
        return "Iniciando processo de upload"
    }
  }

  const getBackgroundGradient = () => {
    switch (status) {
      case "uploading":
        return "from-blue-500/5 via-blue-500/10 to-transparent"
      case "success":
        return "from-green-500/5 via-green-500/10 to-transparent"
      case "error":
        return "from-red-500/5 via-red-500/10 to-transparent"
      default:
        return "from-muted/50 to-transparent"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-700",
            getBackgroundGradient(),
          )}
        />

        <div className="relative">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Upload de Thumbnail</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-6 py-8">
            <div
              className={cn(
                "p-8 rounded-full border-2 transition-all duration-500 backdrop-blur-sm",
                status === "uploading" && "border-blue-200 bg-blue-50/50 shadow-lg shadow-blue-500/20",
                status === "success" && "border-green-200 bg-green-50/50 shadow-lg shadow-green-500/20 scale-110",
                status === "error" && "border-red-200 bg-red-50/50 shadow-lg shadow-red-500/20",
                status === "idle" && "border-border bg-muted/50",
              )}
            >
              {getStatusIcon()}
            </div>

            <div className="text-center space-y-2 max-w-sm">
              <h3 className="text-lg font-semibold text-foreground">{getStatusText()}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{getStatusDescription()}</p>
            </div>

            {status === "uploading" && (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Progresso</span>
                  <span className="text-blue-600 font-semibold tabular-nums">{progress}%</span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-2.5 bg-blue-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
                <p className="text-xs text-center text-muted-foreground">Não feche esta janela durante o upload</p>
              </div>
            )}

            {(status === "error" || status === "success") && (
              <div className="flex gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {status === "error" && onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    className="flex-1 gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors bg-transparent"
                  >
                    <Upload className="w-4 h-4" />
                    Tentar Novamente
                  </Button>
                )}

                <Button
                  onClick={onClose}
                  variant={status === "error" ? "destructive" : "default"}
                  className={cn("flex-1 transition-all", status === "success" && "bg-green-600 hover:bg-green-700")}
                >
                  {status === "success" ? "Concluir" : "Fechar"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}