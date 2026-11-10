import { useEffect, useState } from 'react'

export type ActionResult = { success: true } | { success: false; error: unknown }

interface UseAsyncActionOptions {
  onError?: (error: unknown) => void
  onLoadingChange?: (isLoading: boolean) => void
}

export const useAsyncAction = ({ onError, onLoadingChange }: UseAsyncActionOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const run = async (action: () => Promise<void>): Promise<ActionResult> => {
    setIsLoading(true)

    try {
      await action()
      return { success: true }
    } catch (error: unknown) {
      onError?.(error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, run }
}
