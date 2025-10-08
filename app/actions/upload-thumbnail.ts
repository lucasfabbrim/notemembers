"use server"

import { supabaseServer } from "@/lib/supabase-server"

export async function uploadThumbnailAction(
  formData: FormData,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("[v0] Upload action called")

    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      console.log("[v0] No valid file provided, received:", typeof file)
      return { success: false, error: "Nenhum arquivo fornecido" }
    }

    console.log("[v0] File received:", file.name, file.type, file.size)

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Tipo de arquivo inválido. Use JPEG, PNG ou WebP." }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: "Arquivo muito grande. Tamanho máximo: 5MB." }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `thumbnails/${fileName}`

    console.log("[v0] Uploading to:", filePath)

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Debug: Check if bucket exists
    console.log("[v0] Checking bucket 'videos'...")
    const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets()
    console.log("[v0] Available buckets:", buckets?.map(b => b.name))
    
    if (listError) {
      console.error("[v0] Error listing buckets:", listError)
    }

    const { data, error } = await supabaseServer.storage.from("thumbnail-videos").upload(filePath, uint8Array, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Supabase upload error:", error)
      return { success: false, error: `Erro ao fazer upload: ${error.message}` }
    }

    console.log("[v0] Upload successful:", data)

    const {
      data: { publicUrl },
    } = supabaseServer.storage.from("thumbnail-videos").getPublicUrl(filePath)

    console.log("[v0] Public URL:", publicUrl)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error("[v0] Upload error:", error)
    return { success: false, error: error.message || "Erro ao fazer upload" }
  }
}
