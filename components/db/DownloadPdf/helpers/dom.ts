import { FALLBACK_BG } from '../constants'
import type { Rgb } from '../types'

// Даём браузеру отрисовать кадр со спиннером перед тяжёлой синхронной работой
export const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0))
  })

const parseColor = (color: string): Rgb | null => {
  const match = color.match(/rgba?\(([^)]+)\)/)
  if (!match) return null

  const [r, g, b, a = 1] = match[1].split(',').map((part) => Number(part.trim()))
  return a > 0 ? [r, g, b] : null
}

// Первый непрозрачный фон, поднимаясь от элемента вверх по DOM
export const getBackgroundColor = (el: HTMLElement | null): Rgb => {
  for (let node = el; node; node = node.parentElement) {
    const color = parseColor(getComputedStyle(node).backgroundColor)
    if (color) return color
  }

  return FALLBACK_BG
}
