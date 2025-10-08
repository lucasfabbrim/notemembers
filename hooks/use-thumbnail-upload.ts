"use client"

import { useState } from "react"
import { uploadThumbnailAction } from "@/app/actions/upload-thumbnail"

export function useThumbnailUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      return "Tipo de arquivo inválido. Use JPEG, PNG ou WebP."
    }

    if (file.size > maxSize) {
      return "Arquivo muito grande. Tamanho máximo: 5MB."
    }

    return null
  }

  const upload = async (file: File): Promise<string | null> => {
    setError(null)
    setProgress(0)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return null
    }

    setUploading(true)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadThumbnailAction(formData)

      clearInterval(progressInterval)
      setProgress(100)
      setUploading(false)

      if (!result.success) {
        setError(result.error || "Erro ao fazer upload")
        return null
      }

      return result.url || null
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload")
      setUploading(false)
      return null
    }
  }

  return { upload, uploading, progress, error }
}
