import { resolveLineValue, type LineValues, type LineValueSpec } from './lineValue'

export const LINE_WIDTH_SPEC: LineValueSpec = { min: 0.5, max: 3, step: 0.1, fallback: 1 }

export const resolveLineWidthScale = (values: LineValues | undefined, lineId: string): number =>
  resolveLineValue(LINE_WIDTH_SPEC, values, lineId)
