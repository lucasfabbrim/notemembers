"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThumbnailUpload } from "@/hooks/use-thumbnail-upload"
import { cn } from "@/lib/utils"

interface ThumbnailUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function ThumbnailUpload({ value, onChange, className }: ThumbnailUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress, error } = useThumbnailUpload()

  const handleFile = async (file: File) => {
    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    const url = await upload(file)
    if (url) {
      onChange(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          preview ? "aspect-video" : "aspect-video",
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-full group">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">{progress}%</p>
                </div>
              </div>
            )}
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Fazendo upload... {progress}%</p>
                <div className="w-full max-w-xs h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Arraste uma imagem ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mb-4">JPEG, PNG ou WebP (máx. 5MB)</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo
                </Button>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
