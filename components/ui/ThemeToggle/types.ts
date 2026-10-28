import type { THEME_VALUE } from './const'

export type TTheme = (typeof THEME_VALUE)[keyof typeof THEME_VALUE]

export interface IThemeContextType {
  theme: TTheme
  setTheme: (theme: TTheme) => void
  isMounted: boolean
}
