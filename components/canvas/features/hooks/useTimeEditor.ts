import { type ChangeEvent, useCallback, useState } from 'react'

interface UseTimeEditorOptions {
  initialMinutes: number
  onSave: (minutes: number) => Promise<void>
  onSuccess: () => void
  onSaveError?: (error: unknown) => void
}

export const useTimeEditor = ({
  initialMinutes,
  onSave,
  onSuccess,
  onSaveError,
}: UseTimeEditorOptions) => {
  const [time, setTime] = useState(String(initialMinutes))
  const [isLoading, setIsLoading] = useState(false)

  const handleTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (/^\d*$/.test(value)) {
      setTime(value)
    }
  }, [])

  const parsedTime = Number(time)
  const isValidTime = time.trim() !== '' && parsedTime > 0
  const isSaveDisabled = isLoading || !isValidTime || parsedTime === initialMinutes

  // Общая обёртка: включает загрузку, закрывает модалку при успехе, ловит ошибку
  const runAction = useCallback(
    async (action: () => Promise<void>, onError: (error: unknown) => void) => {
      setIsLoading(true)

      try {
        await action()
        onSuccess()
      } catch (error) {
        onError(error)
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess]
  )

  const handleSave = useCallback(async () => {
    if (isSaveDisabled) return

    await runAction(
      () => onSave(parsedTime),
      (error) => {
        console.error('Failed to save time:', error)
        onSaveError?.(error)
      }
    )
  }, [isSaveDisabled, runAction, onSave, parsedTime, onSaveError])

  return {
    time,
    isLoading,
    isSaveDisabled,
    handleTimeChange,
    handleSave,
    runAction,
  }
}
