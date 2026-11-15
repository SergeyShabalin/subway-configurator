import type Konva from 'konva'

// Отключает дорогие эффекты на время экспорта, возвращает функцию отката
export const lightenStage = (stage: Konva.Stage): (() => void) => {
  const shapes = stage.find('Shape') as Array<Konva.Shape>

  const saved = shapes.map((shape) => ({
    shape,
    shadow: shape.shadowEnabled(),
    shadowForStroke: shape.shadowForStrokeEnabled(),
    perfectDraw: shape.perfectDrawEnabled(),
  }))

  console.log(
    `[pdf] shapes: ${shapes.length}, with shadow: ${saved.filter((s) => s.shadow).length}, ` +
      `with filters: ${shapes.filter((s) => s.filters()?.length).length}`
  )

  for (const { shape } of saved) {
    shape.shadowEnabled(false)
    shape.shadowForStrokeEnabled(false)
    shape.perfectDrawEnabled(false)
  }

  return () => {
    for (const { shape, shadow, shadowForStroke, perfectDraw } of saved) {
      shape.shadowEnabled(shadow)
      shape.shadowForStrokeEnabled(shadowForStroke)
      shape.perfectDrawEnabled(perfectDraw)
    }
  }
}
