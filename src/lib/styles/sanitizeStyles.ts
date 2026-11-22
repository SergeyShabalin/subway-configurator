import type { LabelStyle, MapStyles } from '@/types/metro'

export const LABEL_FONT_SIZE_MIN = 8
export const LABEL_FONT_SIZE_MAX = 32
const HEX = /^#[0-9a-fA-F]{6}$/

export const sanitizeStyles = (raw: unknown): MapStyles => {
  const labelsRaw = (raw as { labels?: unknown } | null)?.labels
  if (typeof labelsRaw !== 'object' || labelsRaw === null) return {}

  const src = labelsRaw as Record<string, unknown>
  const labels: LabelStyle = {}

  if (typeof src.fontSize === 'number' && Number.isFinite(src.fontSize)) {
    labels.fontSize = Math.min(
      LABEL_FONT_SIZE_MAX,
      Math.max(LABEL_FONT_SIZE_MIN, Math.round(src.fontSize))
    )
  }
  if (typeof src.bold === 'boolean') labels.bold = src.bold
  if (typeof src.italic === 'boolean') labels.italic = src.italic
  if (typeof src.colorLight === 'string' && HEX.test(src.colorLight)) {
    labels.colorLight = src.colorLight
  }
  if (typeof src.colorDark === 'string' && HEX.test(src.colorDark)) {
    labels.colorDark = src.colorDark
  }

  return Object.keys(labels).length ? { labels } : {}
}
