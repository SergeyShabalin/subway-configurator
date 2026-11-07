'use client'

import { graphService } from '@/src/lib/services'
import { createMetroStore, type MetroInitState, type MetroStoreApi } from '@/store/createMetroStore'
import type { GraphSource } from '@/store/slices/loaderSlice'
import type { MetroStore } from '@/store/types'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'

const MetroStoreContext = createContext<MetroStoreApi | null>(null)

interface MetroStoreProviderProps {
  children: ReactNode
  /** Источник данных. По умолчанию реальный сервис, в тестах передаётся мок. */
  source?: GraphSource
  /** Начальное состояние (тесты, Storybook). */
  initState?: MetroInitState
}

export const MetroStoreProvider = ({
  children,
  source = graphService,
  initState,
}: MetroStoreProviderProps) => {
  // Стор создаётся один раз на жизнь провайдера, при SSR это один стор на запрос
  const [store] = useState(() => createMetroStore(source, initState))

  return <MetroStoreContext.Provider value={store}>{children}</MetroStoreContext.Provider>
}

/** Объект стора для императивного доступа (getState, subscribe) в обработчиках. */
export const useMetroStoreApi = (): MetroStoreApi => {
  const store = useContext(MetroStoreContext)
  if (!store) throw new Error('useMetroStore must be used within MetroStoreProvider')
  return store
}

export const useMetroStore = <T,>(selector: (state: MetroStore) => T): T =>
  useStore(useMetroStoreApi(), selector)
