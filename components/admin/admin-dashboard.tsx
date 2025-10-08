"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { Icon } from "@iconify/react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardStats {
  totalUsers: number
  totalVideos: number
  totalCategories: number
  users: any[]
  videos: any[]
  categories: any[]
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [creatingVideo, setCreatingVideo] = useState(false)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) return

      const [usersRes, categoriesRes] = await Promise.all([
        api.admin.getAllUsers(token),
        api.admin.getAllCategories(token),
      ])

      const categories = categoriesRes.data || []

      // Fetch videos from all categories
      const allVideos: any[] = []
      for (const category of categories) {
        try {
          const videosRes = await api.categories.getVideos(category.slug, token)
          const videos = videosRes.data?.videos || []
          // Add category info to each video
          videos.forEach((video: any) => {
            allVideos.push({
              ...video,
              category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
              },
            })
          })
        } catch (error) {
          console.error(`Erro ao buscar vídeos da categoria ${category.slug}:`, error)
        }
      }

      setStats({
        totalUsers: usersRes.total || usersRes.data?.length || 0,
        totalCategories: categories.length,
        totalVideos: allVideos.length,
        users: usersRes.data || [],
        categories: categories,
        videos: allVideos,
      })
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (data: any) => {
    try {
      setActionLoading(true)
      const token = getAuthToken()
      if (!token) return
      await api.admin.createCategory(data, token)
      await loadDashboardData()
      setCreatingCategory(false)
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateCategory = async (slug: string, data: any) => {
    try {
      setActionLoading(true)
      const token = getAuthToken()
      if (!token) return
      await api.admin.updateCategory(slug, data, token)
      await loadDashboardData()
      setEditingCategory(null)
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return
    try {
      setActionLoading(true)
      const token = getAuthToken()
      if (!token) return
      await api.admin.deleteCategory(slug, token)
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateVideo = async (data: any) => {
    try {
      setActionLoading(true)
      const token = getAuthToken()
      if (!token) return

      const { category_slug, thumbnail_url, title, ...rest } = data

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      const videoData = {
        title,
        slug,
        description: rest.description || "",
        url: rest.video_url || "",
        thumbnail: thumbnail_url || "",
        duration: 0,
        isPublished: true,
      }

      await api.admin.createVideo(category_slug, videoData, token)
      await loadDashboardData()
      setCreatingVideo(false)
      setSelectedCategorySlug("")
    } catch (error: any) {
      console.error("Erro ao criar vídeo:", error?.message || error)
      alert(`Erro ao criar vídeo: ${error?.message || "Erro desconhecido"}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateVideo = async (categorySlug: string, videoSlug: string, data: any) => {
    try {
      setActionLoading(true)
      const token = getAuthToken()
      if (!token) return

      const { thumbnail_url, title, ...rest } = data

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      const videoData = {
        title,
        slug,
        description: rest.description || "",
        video_url: rest.video_url || "",
        thumbnail: thumbnail_url || "",
        duration: data.duration || 0,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      }

      await api.admin.updateVideo(categorySlug, videoSlug, videoData, token)
      await loadDashboardData()
      setEditingVideo(null)
    } catch (error) {
      console.error("Erro ao atualizar vídeo:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteVideo = async (categorySlug: string, videoSlug: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return
    try {
      setActionLoading(true)
      const token = getAuthToken()
      if (!token) return
      await api.admin.deleteVideo(categorySlug, videoSlug, token)
      await loadDashboardData()
    } catch (error) {
      console.error("Erro ao excluir vídeo:", error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!stats) return null

  const overviewData = [
    { name: "Usuários", value: stats.totalUsers },
    { name: "Vídeos", value: stats.totalVideos },
    { name: "Categorias", value: stats.totalCategories },
  ]

  const chartConfig = {
    value: { label: "Total", color: "hsl(var(--primary))" },
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Usuários</CardTitle>
            <Icon icon="solar:users-group-rounded-bold" className="h-3 w-3 sm:h-5 sm:w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:flex items-center gap-1">
              <Icon icon="solar:graph-up-bold" className="h-3 w-3" />
              Usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Vídeos</CardTitle>
            <Icon icon="solar:videocamera-bold" className="h-3 w-3 sm:h-5 sm:w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">{stats.totalVideos}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:flex items-center gap-1">
              <Icon icon="solar:graph-up-bold" className="h-3 w-3" />
              Vídeos publicados
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Categorias</CardTitle>
            <Icon icon="solar:folder-bold" className="h-3 w-3 sm:h-5 sm:w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold">{stats.totalCategories}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:flex items-center gap-1">
              <Icon icon="solar:graph-up-bold" className="h-3 w-3" />
              Categorias ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Geral</CardTitle>
          <CardDescription>Visão geral da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Categorias</CardTitle>
            <CardDescription>Todas as categorias - Totalmente editável</CardDescription>
          </div>
          <Button onClick={() => setCreatingCategory(true)} disabled={actionLoading} className="gap-2">
            <Icon icon="solar:add-circle-bold" className="h-5 w-5" />
            Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.categories.map((category) => (
              <Card
                key={category.id || category.slug}
                className="border-muted hover:border-purple-500/40 transition-colors"
              >
                <CardHeader>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{category.description || "Sem descrição"}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                    disabled={actionLoading}
                    className="flex-1 gap-1"
                  >
                    <Icon icon="solar:pen-bold" className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.slug)}
                    disabled={actionLoading}
                    className="flex-1 gap-1 text-destructive"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="h-3 w-3" />
                    Excluir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Videos Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Vídeos</CardTitle>
            <CardDescription>Todos os vídeos - Totalmente editável</CardDescription>
          </div>
          <Button onClick={() => setCreatingVideo(true)} disabled={actionLoading} className="gap-2">
            <Icon icon="solar:add-circle-bold" className="h-5 w-5" />
            Novo Vídeo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.videos.map((video) => (
              <Card key={video.id} className="border-muted hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">{video.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      {video.category?.name || "N/A"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{video.description || "Sem descrição"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {video.products?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {video.products.map((p: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingVideo(video)}
                      disabled={actionLoading}
                      className="flex-1 gap-1"
                    >
                      <Icon icon="solar:pen-bold" className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.category?.slug, video.slug)}
                      disabled={actionLoading}
                      className="flex-1 gap-1 text-destructive"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="h-3 w-3" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Todos os usuários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Produtos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.purchases?.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {user.purchases
                              .flatMap((p: any) => p.products || [])
                              .map((prod: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {prod}
                                </Badge>
                              ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Nenhum</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={creatingCategory} onOpenChange={setCreatingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>Crie uma nova categoria</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateCategory({
                name: formData.get("name"),
                description: formData.get("description"),
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={actionLoading}>
              Criar Categoria
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>Atualize as informações da categoria</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleUpdateCategory(editingCategory.slug, {
                  name: formData.get("name"),
                  description: formData.get("description"),
                })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" defaultValue={editingCategory.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" defaultValue={editingCategory.description} rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={actionLoading}>
                Salvar Alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Video Dialog */}
      <Dialog
        open={creatingVideo}
        onOpenChange={(open) => {
          setCreatingVideo(open)
          if (!open) setSelectedCategorySlug("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Vídeo</DialogTitle>
            <DialogDescription>Adicione um novo vídeo</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const products = formData.get("products") as string

              if (!selectedCategorySlug) {
                alert("Por favor, selecione uma categoria")
                return
              }

              handleCreateVideo({
                category_slug: selectedCategorySlug,
                title: formData.get("title"),
                description: formData.get("description"),
                video_url: formData.get("video_url"),
                thumbnail_url: formData.get("thumbnail_url"),
                products: products ? products.split(",").map((p) => p.trim()) : [],
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category_slug">Categoria</Label>
              <Select value={selectedCategorySlug} onValueChange={setSelectedCategorySlug} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {stats.categories.map((cat) => (
                    <SelectItem key={cat.id || cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input id="video_url" name="video_url" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
              <Input id="thumbnail_url" name="thumbnail_url" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="products">Produtos (separados por vírgula)</Label>
              <Input id="products" name="products" placeholder="produto1, produto2" />
            </div>
            <Button type="submit" className="w-full" disabled={actionLoading}>
              Criar Vídeo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vídeo</DialogTitle>
            <DialogDescription>Atualize as informações do vídeo</DialogDescription>
          </DialogHeader>
          {editingVideo && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const products = formData.get("products") as string
                handleUpdateVideo(editingVideo.category?.slug, editingVideo.slug, {
                  title: formData.get("title"),
                  description: formData.get("description"),
                  video_url: formData.get("video_url"),
                  thumbnail_url: formData.get("thumbnail_url"),
                  products: products ? products.split(",").map((p) => p.trim()) : [],
                })
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" defaultValue={editingVideo.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" defaultValue={editingVideo.description} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input id="video_url" name="video_url" defaultValue={editingVideo.video_url} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
                <Input id="thumbnail_url" name="thumbnail_url" defaultValue={editingVideo.thumbnail_url} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="products">Produtos (separados por vírgula)</Label>
                <Input
                  id="products"
                  name="products"
                  defaultValue={editingVideo.products?.join(", ") || ""}
                  placeholder="produto1, produto2"
                />
              </div>
              <Button type="submit" className="w-full" disabled={actionLoading}>
                Salvar Alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
