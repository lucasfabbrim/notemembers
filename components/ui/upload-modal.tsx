"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Upload, Loader2 } from "lucide-react"
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

export function UploadModal({ 
  isOpen, 
  onClose, 
  status, 
  progress, 
  error, 
  onRetry 
}: UploadModalProps) {
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
        return <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <Upload className="w-16 h-16 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return "Fazendo upload da thumbnail..."
      case "success":
        return "Thumbnail enviada com sucesso!"
      case "error":
        return "Erro ao enviar thumbnail"
      default:
        return "Preparando upload..."
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "uploading":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Upload de Thumbnail</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Status Icon */}
          <div className={cn(
            "p-6 rounded-full border-2 transition-all duration-300",
            getStatusColor(),
            showSuccess && "scale-110"
          )}>
            {getStatusIcon()}
          </div>

          {/* Status Text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {getStatusText()}
            </h3>
            {status === "error" && error && (
              <p className="text-sm text-red-600 max-w-xs">
                {error}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {status === "uploading" && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {status === "error" && onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Tentar Novamente
              </Button>
            )}
            
            {status === "error" && (
              <Button 
                onClick={onClose}
                variant="destructive"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
