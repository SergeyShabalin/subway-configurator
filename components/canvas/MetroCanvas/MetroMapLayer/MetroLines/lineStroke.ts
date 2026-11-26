import type { LineType } from '@/types/metro'
import { HIT_STROKE_WIDTH, RAIL_GAP, RAIL_LINE_WIDTH, SUBWAY_WIDTH } from './constants'

export interface LineStroke {
  /** Толщина одной линии */
  width: number
  /** Расстояние между рельсами (0 для линий из одного пути) */
  gap: number
  /** Толщина зоны попадания курсора */
  hitWidth: number
}

/** Новый тип линии добавляется записью в эту таблицу. */
const BASE_STROKE: Record<LineType, { width: number; gap: number }> = {
  subway: { width: SUBWAY_WIDTH, gap: 0 },
  commuter_rail: { width: RAIL_LINE_WIDTH, gap: RAIL_GAP },
}

export const getLineStroke = (lineType: LineType, scale: number): LineStroke => {
  const base = BASE_STROKE[lineType]
  const width = base.width * scale
  return {
    width,
    gap: base.gap * scale,
    hitWidth: Math.max(HIT_STROKE_WIDTH, width),
  }
}
