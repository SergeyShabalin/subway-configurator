import type Konva from 'konva'

export const setPointerCursor = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = e.target.getStage()

  if (stage) {
    stage.container().style.cursor = 'grab'
  }
}

export const resetCursor = (e: Konva.KonvaEventObject<MouseEvent | DragEvent>) => {
  const stage = e.target.getStage()

  if (stage) {
    stage.container().style.cursor = 'default'
  }
}

export const stopEventPropagation = (e: Konva.KonvaEventObject<MouseEvent>) => {
  e.cancelBubble = true
}
