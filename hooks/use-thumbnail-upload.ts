"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function useThumbnailUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [onStatusChange, setOnStatusChange] = useState<((status: "uploading" | "success" | "error", progress?: number, error?: string) => void) | null>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    const maxSize = 2 * 1024 * 1024 // 2MB

    if (!validTypes.includes(file.type)) {
      return "Tipo de arquivo inválido. Use JPEG, PNG ou WebP."
    }

    if (file.size > maxSize) {
      return "Arquivo muito grande. Tamanho máximo: 2MB."
    }

    return null
  }

  const setFile = (file: File): string | null => {
    setError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return null
    }
    setPendingFile(file)
    return null // No error, file is valid
  }

  const upload = async (): Promise<string | null> => {
    if (!pendingFile) {
      const errorMsg = "Nenhum arquivo selecionado"
      setError(errorMsg)
      onStatusChange?.("error", 0, errorMsg)
      return null
    }

    setError(null)
    setProgress(0)
    setUploading(true)
    onStatusChange?.("uploading", 0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 10, 90)
          onStatusChange?.("uploading", newProgress)
          return newProgress
        })
      }, 200)

      const fileExt = pendingFile.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { data, error } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_BUCKET_THUMBNAIL_VIDEOS || 'thumbnail-videos')
        .upload(filePath, pendingFile, {
          contentType: pendingFile.type,
          cacheControl: "3600",
          upsert: false,
        })

      clearInterval(progressInterval)
      setProgress(100)
      onStatusChange?.("uploading", 100)

      if (error) {
        const errorMsg = `Erro ao fazer upload: ${error.message}`
        setError(errorMsg)
        setUploading(false)
        onStatusChange?.("error", 0, errorMsg)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from(process.env.NEXT_PUBLIC_BUCKET_THUMBNAIL_VIDEOS || 'thumbnail-videos')
        .getPublicUrl(filePath)

      setUploading(false)
      setPendingFile(null)
      onStatusChange?.("success", 100)
      return publicUrl
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao fazer upload"
      setError(errorMsg)
      setUploading(false)
      onStatusChange?.("error", 0, errorMsg)
      return null
    }
  }

  const clearFile = () => {
    setPendingFile(null)
    setError(null)
    setProgress(0)
  }

  return { 
    setFile, 
    upload, 
    uploading, 
    progress, 
    error, 
    pendingFile,
    clearFile,
    validateFile,
    setOnStatusChange
  }
}
