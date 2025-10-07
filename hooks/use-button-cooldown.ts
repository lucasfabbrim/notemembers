"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface CooldownState {
  isLoading: boolean
  cooldownSeconds: number
  buttonId: string | null
}

let globalCooldownState: CooldownState = {
  isLoading: false,
  cooldownSeconds: 0,
  buttonId: null,
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useButtonCooldown(buttonId: string, cooldownDuration = 3) {
  const [state, setState] = useState(globalCooldownState)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const listener = () => setState({ ...globalCooldownState })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startCooldown = useCallback(
    async (action: () => Promise<void>) => {
      // Prevent multiple clicks
      if (globalCooldownState.isLoading) {
        return
      }

      // Set loading state
      globalCooldownState = {
        isLoading: true,
        cooldownSeconds: 0,
        buttonId,
      }
      notifyListeners()

      try {
        // Execute the action
        await action()

        // Start countdown after successful action
        globalCooldownState = {
          isLoading: false,
          cooldownSeconds: cooldownDuration,
          buttonId,
        }
        notifyListeners()

        // Countdown timer
        intervalRef.current = setInterval(() => {
          if (globalCooldownState.cooldownSeconds > 0) {
            globalCooldownState = {
              ...globalCooldownState,
              cooldownSeconds: globalCooldownState.cooldownSeconds - 1,
            }
            notifyListeners()
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
            globalCooldownState = {
              isLoading: false,
              cooldownSeconds: 0,
              buttonId: null,
            }
            notifyListeners()
          }
        }, 1000)
      } catch (error) {
        // Reset on error
        if (intervalRef.current) clearInterval(intervalRef.current)
        globalCooldownState = {
          isLoading: false,
          cooldownSeconds: 0,
          buttonId: null,
        }
        notifyListeners()
        throw error
      }
    },
    [buttonId, cooldownDuration],
  )

  const isDisabled =
    state.isLoading || (state.cooldownSeconds > 0 && state.buttonId !== buttonId) || state.cooldownSeconds > 0

  const isThisButtonLoading = state.isLoading && state.buttonId === buttonId
  const showCountdown = state.cooldownSeconds > 0 && state.buttonId === buttonId

  const getRemainingSeconds = () => {
    return state.cooldownSeconds
  }

  return {
    startCooldown,
    isDisabled,
    isLoading: isThisButtonLoading,
    cooldownSeconds: showCountdown ? state.cooldownSeconds : 0,
    isAnyButtonLoading: state.isLoading,
    getRemainingSeconds, // Export function to get remaining seconds
  }
}
