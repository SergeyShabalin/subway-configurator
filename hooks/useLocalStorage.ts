'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * SSR-safe хук. На сервере и при первом рендере на клиенте возвращает initialValue,
 * после монтирования читает значение из localStorage (isMounted = true).
 * Это исключает hydration mismatch.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored) as T)
      }
    } catch {
      // localStorage недоступен или значение битое — остаёмся на initialValue
    }
    setIsMounted(true)
  }, [key])

  const setStoredValue = useCallback(
    (newValue: T) => {
      setValue(newValue)
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue))
      } catch {
        // игнорируем ошибки записи (private mode, переполнение)
      }
    },
    [key]
  )

  return [value, setStoredValue, isMounted] as const
}
