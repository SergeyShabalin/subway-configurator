export interface LineValueSpec {
  min: number
  max: number
  step: number
  /** Значение для линии без записи в стилях */
  fallback: number
}

export type LineValues = Record<string, number>

export const clampLineValue = (spec: LineValueSpec, value: number): number => {
  const clamped = Math.min(spec.max, Math.max(spec.min, value))
  return Number((Math.round(clamped / spec.step) * spec.step).toFixed(2))
}

export const resolveLineValue = (
  spec: LineValueSpec,
  values: LineValues | undefined,
  lineId: string
): number => values?.[lineId] ?? spec.fallback

export const sanitizeLineValues = (spec: LineValueSpec, raw: unknown): LineValues | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined

  const values: LineValues = {}
  for (const [lineId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      values[lineId] = clampLineValue(spec, value)
    }
  }

  return Object.keys(values).length ? values : undefined
}
