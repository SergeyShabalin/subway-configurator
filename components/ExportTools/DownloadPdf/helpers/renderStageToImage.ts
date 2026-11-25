import type Konva from 'konva'
import { JPEG_QUALITY, MAX_AREA_PX, MAX_SIDE_PX, PADDING, TARGET_PIXEL_RATIO } from '../constants'
import { ExportError } from '../errors'
import type { RenderedImage, Rgb } from '../types'
import { createLegend, type LegendConfig } from './createLegend'

const getPixelRatio = (width: number, height: number) =>
  Math.min(
    TARGET_PIXEL_RATIO,
    MAX_SIDE_PX / Math.max(width, height),
    Math.sqrt(MAX_AREA_PX / (width * height))
  )

const canvasToJpegBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ExportError('encodeFailed'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  })

const loadLegendFonts = (fontFamily: string) =>
  Promise.all([
    document.fonts.load(`400 16px ${fontFamily}`, 'Аa'),
    document.fonts.load(`700 16px ${fontFamily}`, 'Аa'),
  ]).catch(() => undefined)

export const renderStageToImage = async (
  stage: Konva.Stage,
  background: Rgb,
  legendConfig: LegendConfig | null = null
): Promise<RenderedImage> => {
  const bounds = stage.getLayers()[0]?.getClientRect({ skipTransform: true })

  if (!bounds || bounds.width === 0 || bounds.height === 0) {
    throw new ExportError('emptyMap')
  }

  const scale = stage.scaleX()
  const { x: posX, y: posY } = stage.position()

  const mapWidth = bounds.width + PADDING * 2
  const mapHeight = bounds.height + PADDING * 2

  if (legendConfig) await loadLegendFonts(legendConfig.fontFamily)
  const legend = legendConfig
    ? createLegend({ ...legendConfig, width: mapWidth, background })
    : null

  const totalHeight = mapHeight + (legend?.height ?? 0)
  const ratio = getPixelRatio(mapWidth, totalHeight)

  const source = stage.toCanvas({
    x: (bounds.x - PADDING) * scale + posX,
    y: (bounds.y - PADDING) * scale + posY,
    width: mapWidth * scale,
    height: mapHeight * scale,
    pixelRatio: ratio / scale,
  })

  // JPEG без альфы: заливаем фон, рисуем карту, под ней легенду
  const target = document.createElement('canvas')
  target.width = source.width
  target.height = Math.ceil(totalHeight * ratio)

  const ctx = target.getContext('2d')
  if (!ctx) throw new ExportError('encodeFailed')

  ctx.fillStyle = `rgb(${background.join(',')})`
  ctx.fillRect(0, 0, target.width, target.height)
  ctx.drawImage(source, 0, 0)

  if (legend) {
    ctx.save()
    ctx.scale(ratio, ratio)
    legend.draw(ctx, mapHeight)
    ctx.restore()
  }

  // освобождаем память под канвасы как можно раньше
  source.width = source.height = 0

  const blob = await canvasToJpegBlob(target)
  target.width = target.height = 0

  return { bytes: new Uint8Array(await blob.arrayBuffer()), width: mapWidth, height: totalHeight }
}
