import type Konva from 'konva'
import { MAX_AREA_PX, MAX_SIDE_PX, PADDING, TARGET_PIXEL_RATIO } from '../constants'
import type { RenderedImage } from '../types'
import { ExportError } from '../types'

const getPixelRatio = (width: number, height: number) =>
  Math.min(
    TARGET_PIXEL_RATIO,
    MAX_SIDE_PX / Math.max(width, height),
    Math.sqrt(MAX_AREA_PX / (width * height))
  )

export const renderStageToImage = (stage: Konva.Stage): RenderedImage => {
  const bounds = stage.getLayers()[0]?.getClientRect({ skipTransform: true })

  if (!bounds || bounds.width === 0 || bounds.height === 0) {
    throw new ExportError('emptyMap')
  }

  const scale = stage.scaleX()
  const { x: posX, y: posY } = stage.position()

  const width = bounds.width + PADDING * 2
  const height = bounds.height + PADDING * 2

  const dataUrl = stage.toDataURL({
    x: (bounds.x - PADDING) * scale + posX,
    y: (bounds.y - PADDING) * scale + posY,
    width: width * scale,
    height: height * scale,
    pixelRatio: getPixelRatio(width, height) / scale,
    mimeType: 'image/png',
  })

  return { dataUrl, width, height }
}
