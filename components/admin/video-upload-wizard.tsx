"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { ThumbnailUpload } from "@/components/ui/thumbnail-upload"
import { LoadingModal } from "@/components/ui/loading-modal"
import { Icon } from "@iconify/react"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

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

interface VideoUploadWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  products: Product[]
  onSuccess: () => void
}

type WizardStep = "basic" | "media" | "access" | "review"

export function VideoUploadWizard({ open, onOpenChange, categories, products, onSuccess }: VideoUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("basic")
  const [loadingStatus, setLoadingStatus] = useState<"loading" | "success" | "error" | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

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

  const resetWizard = () => {
    setCurrentStep("basic")
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

  const handleNext = () => {
    const steps: WizardStep[] = ["basic", "media", "access", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: WizardStep[] = ["basic", "media", "access", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleSubmit = async () => {
    setLoadingStatus("loading")

    try {
      const token = getAuthToken()
      if (!token) throw new Error("Token não encontrado")

      const payload = {
        title: formData.title,
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        description: formData.description,
        url: formData.url,
        thumbnail: formData.thumbnail,
        duration: formData.duration,
        isPublished: formData.isPublished,
      }

      await api.admin.createVideo(formData.categorySlug, payload, token)

      setLoadingStatus("success")
      setTimeout(() => {
        setLoadingStatus(null)
        onOpenChange(false)
        resetWizard()
        onSuccess()
        toast({ title: "Vídeo criado com sucesso!" })
      }, 2000)
    } catch (error: any) {
      setLoadingStatus("error")
      setErrorMessage(error.message || "Erro ao criar vídeo")
      setTimeout(() => {
        setLoadingStatus(null)
      }, 3000)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case "basic":
        return formData.title && formData.description && formData.categorySlug
      case "media":
        return formData.url
      case "access":
        return true
      case "review":
        return true
      default:
        return false
    }
  }

  const getStepIcon = (step: WizardStep) => {
    const icons = {
      basic: "solar:document-text-bold",
      media: "solar:videocamera-bold",
      access: "solar:lock-keyhole-bold",
      review: "solar:check-circle-bold",
    }
    return icons[step]
  }

  const getStepTitle = (step: WizardStep) => {
    const titles = {
      basic: "Informações Básicas",
      media: "Mídia do Vídeo",
      access: "Controle de Acesso",
      review: "Revisão Final",
    }
    return titles[step]
  }

  return (
    <>
      <Dialog open={open && !loadingStatus} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon={getStepIcon(currentStep)} className="w-5 h-5 text-primary" />
              {getStepTitle(currentStep)}
            </DialogTitle>
            <DialogDescription>
              Passo {["basic", "media", "access", "review"].indexOf(currentStep) + 1} de 4
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 py-2">
            {(["basic", "media", "access", "review"] as WizardStep[]).map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-2 rounded-full flex-1 transition-colors ${
                    ["basic", "media", "access", "review"].indexOf(currentStep) >= index ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 py-4">
            {/* Step 1: Basic Info */}
            {currentStep === "basic" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Vídeo *</Label>
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
                    rows={4}
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
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2: Media */}
            {currentStep === "media" && (
              <>
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
                    value={formData.thumbnail}
                    onChange={(url) => setFormData({ ...formData, thumbnail: url })}
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
              </>
            )}

            {/* Step 3: Access Control */}
            {currentStep === "access" && (
              <>
                <div className="space-y-2">
                  <Label>Produtos Necessários</Label>
                  <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                    {products.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum produto disponível</p>
                    ) : (
                      products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-3">
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
                    Deixe vazio para acesso livre. Usuários precisam ter comprado pelo menos um dos produtos
                    selecionados.
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer">
                    Publicar vídeo imediatamente
                  </Label>
                </div>
              </>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Título</p>
                    <p className="text-base font-semibold">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <p className="text-sm">{categories.find((c) => c.slug === formData.categorySlug)?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">URL do Vídeo</p>
                    <p className="text-sm truncate">{formData.url}</p>
                  </div>
                  {formData.requiredProducts.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produtos Necessários</p>
                      <p className="text-sm">
                        {formData.requiredProducts.map((id) => products.find((p) => p.id === id)?.name).join(", ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm">{formData.isPublished ? "Publicado" : "Rascunho"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2">
            {currentStep !== "basic" && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            {currentStep !== "review" ? (
              <Button type="button" onClick={handleNext} disabled={!isStepValid()} className="flex-1">
                Continuar
                <Icon icon="solar:arrow-right-bold" className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={!isStepValid()} className="flex-1">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4 mr-2" />
                Criar Vídeo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoadingModal
        open={!!loadingStatus}
        status={loadingStatus || "loading"}
        message="Criando vídeo..."
        successMessage="Vídeo criado com sucesso!"
        errorMessage={errorMessage}
      />
    </>
  )
}
