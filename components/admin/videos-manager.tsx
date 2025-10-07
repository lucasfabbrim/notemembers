"use client"

import type React from "react"
import { Icon } from "@iconify/react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useButtonCooldown } from "@/hooks/use-button-cooldown"
import { ThumbnailUpload, ThumbnailUploadRef } from "@/components/ui/thumbnail-upload"
import { UploadModal } from "@/components/ui/upload-modal"

interface Video {
  id: string
  slug: string
  title: string
  description: string
  url: string
  thumbnail?: string
  duration?: number
  isPublished: boolean
  requiredProducts?: string[]
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
}

export function VideosManager() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<{ video: Video; categorySlug: string } | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    thumbnail: "",
    duration: 0,
    categorySlug: "",
    isPublished: true,
    requiredProducts: [] as string[],
  })
  const { toast } = useToast()
  const { startCooldown } = useButtonCooldown("videos-manager")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const thumbnailUploadRef = useRef<ThumbnailUploadRef>(null)
  
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"uploading" | "success" | "error" | "idle">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | undefined>()

  useEffect(() => {
    loadData()
  }, [])

  // Memoize the status change callback to prevent setState during render
  const handleStatusChange = useCallback((status: "uploading" | "success" | "error", progress?: number, error?: string) => {
    setUploadStatus(status)
    if (progress !== undefined) setUploadProgress(progress)
    if (error) setUploadError(error)
  }, [])

  const loadData = async () => {
    const token = getAuthToken()
    if (!token) return

    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        api.admin.getAllCategories(token),
        api.products.getAll(token),
      ])

      const categoriesData = categoriesResponse.data || []
      setCategories(categoriesData)

      const productsData = productsResponse.data || []
      setProducts(productsData)

      const allVideos: any[] = []
      for (const category of categoriesData) {
        try {
          const videosResponse = await api.categories.getVideos(category.slug, token)
          const categoryVideos = videosResponse.data?.videos || []
          categoryVideos.forEach((video: any) => {
            allVideos.push({
              ...video,
              categorySlug: category.slug,
              categoryName: category.name,
            })
          })
        } catch (error) {
          console.error(`Erro ao carregar vídeos da categoria ${category.name}:`, error)
        }
      }
      setVideos(allVideos)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (video?: Video & { categorySlug: string }) => {
    if (video) {
      setEditingVideo({ video, categorySlug: video.categorySlug })
      setFormData({
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnail: video.thumbnail || "",
        duration: video.duration || 0,
        categorySlug: video.categorySlug,
        isPublished: video.isPublished,
        requiredProducts: video.requiredProducts || [],
      })
    } else {
      setEditingVideo(null)
      setFormData({
        title: "",
        description: "",
        url: "",
        thumbnail: "",
        duration: 0,
        categorySlug: "",
        isPublished: true,
        requiredProducts: [],
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await startCooldown(async () => {
        const token = getAuthToken()
        if (!token) throw new Error("Token não encontrado")

        const slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")

        // Upload thumbnail first if there's a pending file
        let thumbnailUrl = formData.thumbnail
        if (thumbnailUploadRef.current) {
          setUploadModalOpen(true)
          setUploadStatus("uploading")
          setUploadProgress(0)
          
          const uploadedUrl = await thumbnailUploadRef.current.upload()
          if (uploadedUrl) {
            thumbnailUrl = uploadedUrl
          } else {
            // Upload failed, don't proceed with video creation
            setUploadStatus("error")
            return
          }
        }

        const payload = {
          title: formData.title,
          slug,
          description: formData.description,
          url: formData.url,
          thumbnail: thumbnailUrl,
          duration: formData.duration,
          isPublished: formData.isPublished,
          requiredProducts: formData.requiredProducts,
        }

        if (editingVideo) {
          await api.admin.updateVideo(formData.categorySlug, editingVideo.video.slug, payload, token)
          toast({ title: "Vídeo atualizado com sucesso!" })
        } else {
          await api.admin.createVideo(formData.categorySlug, payload, token)
          toast({ title: "Vídeo criado com sucesso!" })
        }
        
        // Close upload modal and show success
        setUploadStatus("success")
        setTimeout(() => {
          setUploadModalOpen(false)
          setDialogOpen(false)
          loadData()
        }, 1500)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categorySlug: string, videoSlug: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return

    await startCooldown(async () => {
      const token = getAuthToken()
      if (!token) return

      await api.admin.deleteVideo(categorySlug, videoSlug, token)
      toast({ title: "Vídeo excluído com sucesso!" })
      loadData()
    })
  }

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Icon icon="svg-spinners:3-dots-fade" className="w-12 h-12 text-primary" />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gerenciar Vídeos</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          Novo Vídeo
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Produtos</TableHead>
                <TableHead className="hidden xl:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum vídeo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((video: any, index) => (
                  <TableRow key={`video-${video.categorySlug}-${video.slug}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon icon="solar:play-circle-bold" className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{video.title}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{video.categoryName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{video.categoryName}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {video.requiredProducts && video.requiredProducts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {video.requiredProducts.slice(0, 2).map((product: string, i: number) => (
                            <Badge key={`${video.categorySlug}-${video.slug}-product-${i}`} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                          {video.requiredProducts.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{video.requiredProducts.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Livre</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {video.isPublished ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          Rascunho
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(video)} title="Editar">
                          <Icon icon="solar:pen-bold" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(video.categorySlug, video.slug)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingVideo ? "Editar Vídeo" : "Novo Vídeo"}</DialogTitle>
              <DialogDescription>
                {editingVideo ? "Atualize as informações do vídeo" : "Preencha os dados para criar um novo vídeo"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Como baixar o template?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo do vídeo"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorySlug">Categoria *</Label>
                <Select
                  value={formData.categorySlug}
                  onValueChange={(value) => setFormData({ ...formData, categorySlug: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={`category-${category.id || index}-${index}`} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL do Vídeo *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... ou URL direta"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Thumbnail do Vídeo</Label>
                <ThumbnailUpload
                  ref={thumbnailUploadRef}
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  onStatusChange={handleStatusChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (segundos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
                  placeholder="120"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Produtos Necessários</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum produto disponível</p>
                  ) : (
                    products.map((product, index) => (
                      <div key={`product-${product.id || index}-${index}`} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={formData.requiredProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                requiredProducts: [...formData.requiredProducts, product.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                requiredProducts: formData.requiredProducts.filter((id) => id !== product.id),
                              })
                            }
                          }}
                          className="w-4 h-4 rounded border-input"
                        />
                        <Label htmlFor={`product-${product.id}`} className="cursor-pointer font-normal">
                          {product.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para acesso livre. Usuários precisam ter comprado pelo menos um dos produtos selecionados.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Publicar vídeo
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icon icon="svg-spinners:3-dots-fade" className="w-4 h-4 mr-2" />
                    {editingVideo ? "Atualizando..." : "Criando..."}
                  </>
                ) : editingVideo ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        status={uploadStatus}
        progress={uploadProgress}
        error={uploadError}
        onRetry={() => {
          setUploadStatus("idle")
          setUploadError(undefined)
          // Retry upload logic can be added here
        }}
      />
    </div>
  )
}
