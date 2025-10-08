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
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useButtonCooldown } from "@/hooks/use-button-cooldown"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price?: number
  stripeProductId?: string
  stripePriceId?: string
  isActive: boolean
  createdAt: string
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stripeProductId: "",
    stripePriceId: "",
    isActive: true,
  })
  const { toast } = useToast()
  const { executeAction } = useButtonCooldown()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successAnimation, setSuccessAnimation] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await api.products.getAll(token)
      setProducts(response.data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price || 0,
        stripeProductId: product.stripeProductId || "",
        stripePriceId: product.stripePriceId || "",
        isActive: product.isActive,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: 0,
        stripeProductId: "",
        stripePriceId: "",
        isActive: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await executeAction(async () => {
        const token = getAuthToken()
        if (!token) throw new Error("Token não encontrado")

        if (editingProduct) {
          await api.products.update(editingProduct.id, formData, token)
          toast({ title: "Produto atualizado com sucesso!" })
        } else {
          await api.products.create(formData, token)
          toast({ title: "Produto criado com sucesso!" })
        }

        // Show success animation
        setSuccessAnimation(true)
        setTimeout(() => {
          setSuccessAnimation(false)
          setDialogOpen(false)
          loadProducts()
        }, 1500)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    await executeAction(async () => {
      const token = getAuthToken()
      if (!token) return

      await api.products.delete(id, token)
      toast({ title: "Produto excluído com sucesso!" })
      loadProducts()
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
        <h2 className="text-2xl font-bold tracking-tight">Gerenciar Produtos</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="hidden lg:table-cell">Preço</TableHead>
                <TableHead className="hidden xl:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum produto cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="solar:bag-4-bold" className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-md truncate">
                      {product.description || "Sem descrição"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.price ? `R$ ${(product.price / 100).toFixed(2)}` : "Grátis"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {product.isActive ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)} title="Editar">
                          <Icon icon="solar:pen-bold" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
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
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Atualize as informações do produto" : "Preencha os dados para criar um novo produto"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Plano Premium"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o produto"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (em centavos)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                  placeholder="9900 = R$ 99,00"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripeProductId">Stripe Product ID</Label>
                <Input
                  id="stripeProductId"
                  value={formData.stripeProductId}
                  onChange={(e) => setFormData({ ...formData, stripeProductId: e.target.value })}
                  placeholder="prod_xxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                <Input
                  id="stripePriceId"
                  value={formData.stripePriceId}
                  onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                  placeholder="price_xxxxx"
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
                  Produto ativo
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="relative">
                {successAnimation && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-md">
                    <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-white animate-bounce" />
                  </div>
                )}
                {isSubmitting ? (
                  <>
                    <Icon icon="svg-spinners:3-dots-fade" className="w-4 h-4 mr-2" />
                    {editingProduct ? "Atualizando..." : "Criando..."}
                  </>
                ) : editingProduct ? (
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
