import type Konva from 'konva'

type HitFunc = (context: Konva.Context, shape: Konva.Shape) => void

/**
 * Создаёт hitFunc, расширяющую зону попадания круга до minScreenRadius
 * в экранных пикселях независимо от масштаба сцены.
 */
export const createTouchHitFunc =
  (minScreenRadius: number): HitFunc =>
  (context, shape) => {
    const scale = shape.getAbsoluteScale().x || 1
    const visibleRadius = (shape as Konva.Circle).radius()
    const hitRadius = Math.max(visibleRadius, minScreenRadius / scale)

    context.beginPath()
    context.arc(0, 0, hitRadius, 0, Math.PI * 2, false)
    context.closePath()
    context.fillStrokeShape(shape)
  }
