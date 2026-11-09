import type { BadgeEnd, LineType } from '@/types/metro'

export interface ResolvedBadge {
  key: string
  lineId: string
  lineType: LineType
  end: BadgeEnd
  text: string
  color: string
  anchorId: string
  x: number
  y: number
}

export interface BadgeAppearance {
  fill: string
  textColor: string
  isDimmed: boolean
}

export interface BadgeGeometry {
  width: number
  height: number
  fontSize: number
  isRail: boolean
}

export interface BadgeMoveParams {
  lineId: string
  end: BadgeEnd
  anchorId: string
  x: number
  y: number
}
