import { resolveLineValue, type LineValues, type LineValueSpec } from './lineValue'

/** 0 даёт прямые углы без закруглений, 1 соответствует DEFAULT_TENSION. */
export const LINE_CURVATURE_SPEC: LineValueSpec = { min: 0, max: 2, step: 0.1, fallback: 1 }

export const resolveLineCurvature = (values: LineValues | undefined, lineId: string): number =>
  resolveLineValue(LINE_CURVATURE_SPEC, values, lineId)
