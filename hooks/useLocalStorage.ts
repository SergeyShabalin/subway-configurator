'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const LOCAL_STORAGE_EVENT = 'local-storage-change'

// Запасное хранилище на случай, когда localStorage недоступен (private mode, блокировка)
const memoryStore = new Map<string, string>()

const readRaw = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memoryStore.get(key) ?? null
  }
}

const writeRaw = (key: string, raw: string) => {
  try {
    window.localStorage.setItem(key, raw)
  } catch {
    memoryStore.set(key, raw)
  }
  // Событие 'storage' не срабатывает в той же вкладке, поэтому уведомляем вручную
  window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT))
}

const emptySubscribe = () => () => {}
const getMountedSnapshot = () => true
const getMountedServerSnapshot = () => false

/**
 * SSR-safe хук на useSyncExternalStore.
 * На сервере и при гидрации возвращает initialValue, затем React сам
 * перерисовывает компонент со значением из localStorage (isMounted = true).
 * Синхронизируется между вкладками через событие 'storage'.
 *
 * Если T — объект, передавай initialValue как константу вне компонента,
 * чтобы не пересоздавать его на каждом рендере.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback)
    window.addEventListener(LOCAL_STORAGE_EVENT, callback)

    return () => {
      window.removeEventListener('storage', callback)
      window.removeEventListener(LOCAL_STORAGE_EVENT, callback)
    }
  }, [])

  const getSnapshot = useCallback(() => readRaw(key), [key])
  const getServerSnapshot = useCallback((): string | null => null, [])

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getMountedSnapshot,
    getMountedServerSnapshot
  )

  const value = useMemo<T>(() => {
    if (raw === null) return initialValue

    try {
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  }, [raw, initialValue])

  const setStoredValue = useCallback(
    (newValue: T) => {
      writeRaw(key, JSON.stringify(newValue))
    },
    [key]
  )

  return [value, setStoredValue, isMounted] as const
}
