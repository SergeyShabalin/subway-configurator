import type { Rgb } from './types'

export const PDF_FILE_NAME = 'metro-map.pdf'
export const PADDING = 40

export const TARGET_PIXEL_RATIO = 4
export const MAX_SIDE_PX = 12_000
export const MAX_AREA_PX = 60_000_000
export const JPEG_QUALITY = 0.95

export const FALLBACK_BG: Rgb = [255, 255, 255]

/**
 * Легенда линий. Размеры заданы для карты шириной REFERENCE_WIDTH
 * и умножаются на коэффициент `ширина карты / REFERENCE_WIDTH` (не меньше 1).
 */
export const LEGEND = {
  REFERENCE_WIDTH: 1000,
  COLUMNS: 3,
  /** Название длиннее обрезается с многоточием */
  MAX_NAME_CHARS: 40,

  FONT_SIZE: 7,
  TITLE_FONT_SIZE: 8,
  TITLE_HEIGHT: 20,
  ROW_HEIGHT: 14,
  COLUMN_GAP: 14,
  ITEM_GAP: 5,

  SYMBOL_WIDTH: 14,
  SUBWAY_STROKE: 2.5,
  RAIL_STROKE: 1,
  RAIL_GAP: 2,

  /** Высота бейджа; остальные размеры бейджа заданы отношением к ней (как в LineBadgeIcon) */
  BADGE_HEIGHT: 10,
  BADGE_SKEW_RATIO: 0.25,
  BADGE_CHAR_WIDTH_RATIO: 0.35,
  BADGE_MIN_WIDTH_RATIO: 1.4,
  BADGE_EXTRA_WIDTH_RATIO: 0.2,
  BADGE_FONT_RATIO: 0.55,
  BADGE_FONT_RATIO_SMALL: 0.45,
} as const

export const LEGEND_TEXT_ON_LIGHT = '#1f2430'
export const LEGEND_TEXT_ON_DARK = '#e5e7eb'
export const LEGEND_LUMINANCE_THRESHOLD = 0.5
export const LEGEND_ELLIPSIS = '…'
