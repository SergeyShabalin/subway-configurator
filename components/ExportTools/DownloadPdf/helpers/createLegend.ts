import { contrastText } from '@/src/lib/color/contrastText'
import type { Line, LineType } from '@/types/metro'
import {
  LEGEND,
  LEGEND_ELLIPSIS,
  LEGEND_LUMINANCE_THRESHOLD,
  LEGEND_TEXT_ON_DARK,
  LEGEND_TEXT_ON_LIGHT,
  PADDING,
} from '../constants'
import type { Rgb } from '../types'

export type LegendLine = Pick<Line, 'id' | 'name' | 'color' | 'type' | 'lineBadge'>

export interface LegendConfig {
  lines: Array<LegendLine>
  title: string
  fontFamily: string
}

interface CreateLegendParams extends LegendConfig {
  width: number
  background: Rgb
}

export interface Legend {
  height: number
  draw: (ctx: CanvasRenderingContext2D, top: number) => void
}

interface LegendItem {
  line: LegendLine
  name: string
  nameWidth: number
  badgeWidth: number
  width: number
}

const TYPE_ORDER: Record<LineType, number> = { subway: 0, commuter_rail: 1 }

const isLight = ([r, g, b]: Rgb) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255 > LEGEND_LUMINANCE_THRESHOLD

const font = (weight: 400 | 700, size: number, family: string) => `${weight} ${size}px ${family}`

const capName = (name: string) =>
  name.length > LEGEND.MAX_NAME_CHARS
    ? name.slice(0, LEGEND.MAX_NAME_CHARS - 1).trimEnd() + LEGEND_ELLIPSIS
    : name

export const createLegend = ({
  lines,
  title,
  fontFamily,
  width,
  background,
}: CreateLegendParams): Legend | null => {
  if (lines.length === 0) return null

  const measureCtx = document.createElement('canvas').getContext('2d')
  if (!measureCtx) return null

  // Коэффициент масштаба: на большой карте легенда крупнее
  const u = Math.max(1, width / LEGEND.REFERENCE_WIDTH)
  const s = (value: number) => value * u

  const side = PADDING * u
  const contentWidth = width - side * 2
  const symbolWidth = s(LEGEND.SYMBOL_WIDTH)
  const itemGap = s(LEGEND.ITEM_GAP)
  const columnGap = s(LEGEND.COLUMN_GAP)

  const badgeHeight = s(LEGEND.BADGE_HEIGHT)
  const badgeSkew = badgeHeight * LEGEND.BADGE_SKEW_RATIO

  const sorted = [...lines].sort((a, b) => (TYPE_ORDER[a.type] ?? 0) - (TYPE_ORDER[b.type] ?? 0))

  const nameFont = font(400, s(LEGEND.FONT_SIZE), fontFamily)

  // Те же правила, что в LineBadgeIcon: круг для метро, параллелограмм для наземных
  const isCircle = (line: LegendLine) => line.type !== 'commuter_rail'

  const getBadgeWidth = (line: LegendLine, text: string) =>
    isCircle(line)
      ? badgeHeight
      : Math.max(
          badgeHeight * LEGEND.BADGE_MIN_WIDTH_RATIO,
          text.length * badgeHeight * LEGEND.BADGE_CHAR_WIDTH_RATIO +
            badgeSkew * 2 +
            badgeHeight * LEGEND.BADGE_EXTRA_WIDTH_RATIO
        )

  const getBadgeFont = (line: LegendLine, text: string) => {
    const ratio =
      isCircle(line) && text.length > 2 ? LEGEND.BADGE_FONT_RATIO_SMALL : LEGEND.BADGE_FONT_RATIO
    return font(700, badgeHeight * ratio, fontFamily)
  }

  const items: Array<LegendItem> = sorted.map((line) => {
    const badgeWidth = line.lineBadge ? getBadgeWidth(line, line.lineBadge) : 0

    const name = capName(line.name)
    measureCtx.font = nameFont
    const nameWidth = measureCtx.measureText(name).width

    const itemWidth = symbolWidth + itemGap + nameWidth + (badgeWidth ? itemGap + badgeWidth : 0)

    return { line, name, nameWidth, badgeWidth, width: itemWidth }
  })

  // Колонка по самому длинному пункту; колонок не больше трёх и не больше, чем влезает
  const columnWidth = Math.max(...items.map((item) => item.width))
  const fitColumns = Math.max(1, Math.floor((contentWidth + columnGap) / (columnWidth + columnGap)))
  const columns = Math.min(LEGEND.COLUMNS, items.length, fitColumns)

  const rows = Math.ceil(items.length / columns)
  const height = s(LEGEND.TITLE_HEIGHT) + rows * s(LEGEND.ROW_HEIGHT) + side
  const textColor = isLight(background) ? LEGEND_TEXT_ON_LIGHT : LEGEND_TEXT_ON_DARK

  const drawSymbol = (ctx: CanvasRenderingContext2D, line: LegendLine, x: number, cy: number) => {
    ctx.strokeStyle = line.color

    if (line.type === 'commuter_rail') {
      const stroke = s(LEGEND.RAIL_STROKE)
      const offset = (s(LEGEND.RAIL_GAP) + stroke) / 2
      ctx.lineWidth = stroke
      ctx.lineCap = 'butt'

      for (const dy of [-offset, offset]) {
        ctx.beginPath()
        ctx.moveTo(x, cy + dy)
        ctx.lineTo(x + symbolWidth, cy + dy)
        ctx.stroke()
      }
      return
    }

    const stroke = s(LEGEND.SUBWAY_STROKE)
    ctx.lineWidth = stroke
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x + stroke / 2, cy)
    ctx.lineTo(x + symbolWidth - stroke / 2, cy)
    ctx.stroke()
  }

  const drawBadge = (
    ctx: CanvasRenderingContext2D,
    line: LegendLine,
    text: string,
    x: number,
    cy: number,
    badgeWidth: number
  ) => {
    const top = cy - badgeHeight / 2
    const bottom = cy + badgeHeight / 2

    ctx.fillStyle = line.color
    ctx.beginPath()

    if (isCircle(line)) {
      ctx.arc(x + badgeWidth / 2, cy, badgeHeight / 2, 0, Math.PI * 2)
    } else {
      ctx.moveTo(x + badgeSkew, top)
      ctx.lineTo(x + badgeWidth, top)
      ctx.lineTo(x + badgeWidth - badgeSkew, bottom)
      ctx.lineTo(x, bottom)
      ctx.closePath()
    }
    ctx.fill()

    ctx.fillStyle = contrastText(line.color)
    ctx.font = getBadgeFont(line, text)
    ctx.textAlign = 'center'
    ctx.fillText(text, x + badgeWidth / 2, cy)
    ctx.textAlign = 'left'
  }

  const draw = (ctx: CanvasRenderingContext2D, top: number) => {
    ctx.save()
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'

    ctx.fillStyle = textColor
    ctx.font = font(700, s(LEGEND.TITLE_FONT_SIZE), fontFamily)
    ctx.fillText(title, side, top + s(LEGEND.TITLE_HEIGHT) / 2)

    const rowsTop = top + s(LEGEND.TITLE_HEIGHT)

    items.forEach((item, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const x = side + column * (columnWidth + columnGap)
      const cy = rowsTop + row * s(LEGEND.ROW_HEIGHT) + s(LEGEND.ROW_HEIGHT) / 2

      drawSymbol(ctx, item.line, x, cy)

      const nameX = x + symbolWidth + itemGap
      ctx.fillStyle = textColor
      ctx.font = nameFont
      ctx.fillText(item.name, nameX, cy)

      if (!item.line.lineBadge) return

      const badgeX = nameX + item.nameWidth + itemGap
      drawBadge(ctx, item.line, item.line.lineBadge, badgeX, cy, item.badgeWidth)
    })

    ctx.restore()
  }

  return { height, draw }
}
