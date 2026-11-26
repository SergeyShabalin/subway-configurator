import type { LabelStyle, MapStyles } from '@/types/metro'

/** Чистые операции над стилями: без стора, без побочных эффектов. */

/** Секции стилей вида «число на линию». Новая секция добавляется сюда и в MapStyles. */
export type LineValueKey = 'lineWidths' | 'lineCurvature'
const LINE_VALUE_KEYS: ReadonlyArray<LineValueKey> = ['lineWidths', 'lineCurvature']

export const mergeLabels = (styles: MapStyles, patch: LabelStyle): MapStyles => ({
  ...styles,
  labels: { ...styles.labels, ...patch },
})

export const clearLabels = (styles: MapStyles): MapStyles => ({ ...styles, labels: undefined })

export const withLineValue = (
  styles: MapStyles,
  key: LineValueKey,
  lineId: string,
  value: number | undefined
): MapStyles => {
  const values = { ...styles[key] }
  if (value === undefined) delete values[lineId]
  else values[lineId] = value

  const next: MapStyles = { ...styles }
  next[key] = values
  return next
}

/** Сбрасывает все числовые настройки одной линии. */
export const clearLine = (styles: MapStyles, lineId: string): MapStyles =>
  LINE_VALUE_KEYS.reduce((acc, key) => withLineValue(acc, key, lineId, undefined), styles)

/** Сбрасывает числовые настройки всех линий. */
export const clearAllLines = (styles: MapStyles): MapStyles => {
  const next: MapStyles = { ...styles }
  for (const key of LINE_VALUE_KEYS) next[key] = undefined
  return next
}

const compactLabels = (labels: LabelStyle | undefined): LabelStyle | undefined => {
  if (!labels) return undefined
  const entries = Object.entries(labels).filter(([, v]) => v !== undefined)
  return entries.length ? (Object.fromEntries(entries) as LabelStyle) : undefined
}

/** Убирает пустые секции и undefined-поля: в БД лежат только заданные значения. */
export const compactStyles = (styles: MapStyles): MapStyles => {
  const labels = compactLabels(styles.labels)
  const result: MapStyles = labels ? { labels } : {}

  for (const key of LINE_VALUE_KEYS) {
    const values = styles[key]
    if (values && Object.keys(values).length) result[key] = values
  }

  return result
}
