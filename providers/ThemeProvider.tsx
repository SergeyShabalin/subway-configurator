'use client'

import { THEME_STORAGE_KEY, THEME_VALUE } from '@/components/ui/ThemeToggle/const'
import type { IThemeContextType, TTheme } from '@/components/ui/ThemeToggle/types'
import { ThemeContext } from '@/context/theme-context'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useEffect, useMemo, type ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme, isMounted] = useLocalStorage<TTheme>(THEME_STORAGE_KEY, THEME_VALUE.DARK)

  useEffect(() => {
    // До монтирования класс уже выставлен inline-скриптом из layout — не трогаем,
    // иначе будет мигание на дефолтной теме.
    if (!isMounted) return

    document.documentElement.classList.toggle(THEME_VALUE.DARK, theme === THEME_VALUE.DARK)
  }, [theme, isMounted])

  const contextValue = useMemo<IThemeContextType>(
    () => ({
      theme,
      setTheme: (newTheme: TTheme) => setTheme(newTheme),
      isMounted,
    }),
    [theme, setTheme, isMounted]
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}
