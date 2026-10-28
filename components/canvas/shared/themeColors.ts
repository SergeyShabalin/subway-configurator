import { THEME_VALUE } from '@/components/ui/ThemeToggle/const'

const LIGHT_BACKGROUND = '#e8ebf1'

export const CANVAS_HOVER_COLOR = {
  [THEME_VALUE.DARK]: '#ffffff',
  [THEME_VALUE.LIGHT]: '#1a1d26',
} as const

export const CANVAS_STATION_FILL = {
  [THEME_VALUE.DARK]: '#020913',
  [THEME_VALUE.LIGHT]: LIGHT_BACKGROUND,
} as const

export const CANVAS_LABEL_FILL = {
  [THEME_VALUE.DARK]: '#e2e8f0',
  [THEME_VALUE.LIGHT]: '#1f2430',
} as const

export const CANVAS_LABEL_HOVER_FILL = {
  [THEME_VALUE.DARK]: '#fbc901',
  [THEME_VALUE.LIGHT]: '#b45309',
} as const

export const CANVAS_LABEL_STROKE = {
  [THEME_VALUE.DARK]: '#020913',
  [THEME_VALUE.LIGHT]: LIGHT_BACKGROUND,
} as const

export const CANVAS_TRANSFER_OUTLINE = {
  [THEME_VALUE.DARK]: '#0f172a',
  [THEME_VALUE.LIGHT]: LIGHT_BACKGROUND,
} as const

export const CANVAS_LABEL_FONT_STYLE = {
  [THEME_VALUE.DARK]: 'normal',
  [THEME_VALUE.LIGHT]: 'bold',
} as const
