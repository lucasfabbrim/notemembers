"use client"

import type React from "react"
import { Icon } from "@iconify/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useButtonCooldown } from "@/hooks/use-button-cooldown"

interface Category {
  id: string
  name: string
  description: string
  slug: string
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    sortOrder: 0,
  })
  const { toast } = useToast()
  const { startCooldown } = useButtonCooldown("categories-manager")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await api.admin.getAllCategories(token)
      setCategories(response.data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: "",
        description: "",
        isActive: true,
        sortOrder: 0,
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

        if (editingCategory) {
          await api.admin.updateCategory(editingCategory.id, formData, token)
          toast({ title: "Categoria atualizada com sucesso!" })
        } else {
          await api.admin.createCategory(formData, token)
          toast({ title: "Categoria criada com sucesso!" })
        }
        setDialogOpen(false)
        loadCategories()
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

    await startCooldown(async () => {
      const token = getAuthToken()
      if (!token) return

      await api.admin.deleteCategory(id, token)
      toast({ title: "Categoria excluída com sucesso!" })
      loadCategories()
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
        <h2 className="text-2xl font-bold tracking-tight">Gerenciar Categorias</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhuma categoria cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={`category-${category.id || index}-${index}`}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-md truncate">{category.description}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(category.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)} title="Editar">
                          <Icon icon="solar:pen-bold" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
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
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Atualize as informações da categoria"
                  : "Preencha os dados para criar uma nova categoria"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Templates Notion"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo desta categoria"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Categoria ativa
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
                    {editingCategory ? "Atualizando..." : "Criando..."}
                  </>
                ) : editingCategory ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
