import type Konva from 'konva'
import { JPEG_QUALITY, MAX_AREA_PX, MAX_SIDE_PX, PADDING, TARGET_PIXEL_RATIO } from '../constants'
import { ExportError } from '../errors'
import type { RenderedImage, Rgb } from '../types'

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

export const renderStageToImage = async (
  stage: Konva.Stage,
  background: Rgb
): Promise<RenderedImage> => {
  const bounds = stage.getLayers()[0]?.getClientRect({ skipTransform: true })

  if (!bounds || bounds.width === 0 || bounds.height === 0) {
    throw new ExportError('emptyMap')
  }

  const scale = stage.scaleX()
  const { x: posX, y: posY } = stage.position()

  const width = bounds.width + PADDING * 2
  const height = bounds.height + PADDING * 2

  const source = stage.toCanvas({
    x: (bounds.x - PADDING) * scale + posX,
    y: (bounds.y - PADDING) * scale + posY,
    width: width * scale,
    height: height * scale,
    pixelRatio: getPixelRatio(width, height) / scale,
  })

  // JPEG без альфы: заливаем фон и рисуем карту поверх
  const target = document.createElement('canvas')
  target.width = source.width
  target.height = source.height

  const ctx = target.getContext('2d')
  if (!ctx) throw new ExportError('encodeFailed')

  ctx.fillStyle = `rgb(${background.join(',')})`
  ctx.fillRect(0, 0, target.width, target.height)
  ctx.drawImage(source, 0, 0)

  // освобождаем память под канвасы как можно раньше
  source.width = source.height = 0

  const blob = await canvasToJpegBlob(target)
  target.width = target.height = 0

  return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height }
}
