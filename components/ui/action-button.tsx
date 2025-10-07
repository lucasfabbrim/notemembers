"use client"

import type React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useButtonCooldown } from "@/hooks/use-button-cooldown"
import { useToast } from "@/hooks/use-toast"

interface ActionButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?: () => Promise<void>
  buttonId: string
  cooldownDuration?: number
  loadingText?: string
  children: React.ReactNode
}

export function ActionButton({
  onClick,
  buttonId,
  cooldownDuration = 3,
  loadingText,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const { startCooldown, isDisabled, isLoading, getRemainingSeconds } = useButtonCooldown(buttonId, cooldownDuration)
  const { toast } = useToast()

  const handleClick = async () => {
    const remaining = getRemainingSeconds()
    if (remaining > 0) {
      toast({
        title: "Aguarde um momento",
        description: `Por favor, aguarde ${remaining} segundo${remaining > 1 ? "s" : ""} antes de tentar novamente.`,
        variant: "default",
      })
      return
    }

    if (onClick) {
      await startCooldown(onClick)
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || "Processando..."}
        </>
      )
    }

    return children
  }

  return (
    <Button {...props} onClick={onClick ? handleClick : undefined} disabled={disabled || isDisabled}>
      {getButtonContent()}
    </Button>
  )
}
