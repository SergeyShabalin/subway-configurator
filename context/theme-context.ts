'use client'

import type { IThemeContextType } from '@/components/ui/ThemeToggle/types'
import { createContext, useContext } from 'react'

export const ThemeContext = createContext<IThemeContextType | null>(null)

export const useTheme = (): IThemeContextType => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
