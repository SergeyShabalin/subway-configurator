import type Konva from 'konva'

type HitFunc = (context: Konva.Context, shape: Konva.Shape) => void

/**
 * Создаёт hitFunc, расширяющую зону попадания до minScreenRadius
 * в экранных пикселях независимо от масштаба сцены.
 * Для квадрата начало локальных координат в левом верхнем углу (из-за offset), центр в (r, r).
 */
export const createTouchHitFunc =
  (minScreenRadius: number, isSquare: boolean): HitFunc =>
  (context, shape) => {
    const scale = shape.getAbsoluteScale().x || 1
    const visibleRadius = isSquare
      ? (shape as Konva.Rect).width() / 2
      : (shape as Konva.Circle).radius()
    const hitRadius = Math.max(visibleRadius, minScreenRadius / scale)

    context.beginPath()
    if (isSquare) {
      const center = visibleRadius
      context.rect(center - hitRadius, center - hitRadius, hitRadius * 2, hitRadius * 2)
    } else {
      context.arc(0, 0, hitRadius, 0, Math.PI * 2, false)
    }
    context.closePath()
    context.fillStrokeShape(shape)
  }
