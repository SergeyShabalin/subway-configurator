export interface PositionedVisual {
  id: string
  x: number
  y: number
}

/**
 * Порядок визуалов линии от начальной станции к конечной.
 * Для обычной линии это участок между ними (направление подстраивается под выбор),
 * для кольцевой путь идёт по ходу линии, с переходом через конец списка.
 */
export const getPathBetween = (
  visualIds: ReadonlyArray<string>,
  startId: string,
  endId: string,
  isCircular: boolean
): Array<string> => {
  const startIndex = visualIds.indexOf(startId)
  const endIndex = visualIds.indexOf(endId)

  if (startIndex < 0 || endIndex < 0 || startIndex === endIndex) return []

  if (isCircular) {
    const path: Array<string> = []

    for (let i = startIndex; ; i = (i + 1) % visualIds.length) {
      path.push(visualIds[i])
      if (i === endIndex) break
    }

    return path
  }

  return startIndex < endIndex
    ? visualIds.slice(startIndex, endIndex + 1)
    : visualIds.slice(endIndex, startIndex + 1).reverse()
}

/** Новые координаты промежуточных станций: они ложатся на прямую между первой и последней с равными интервалами. */
export const alignOnStraightLine = (
  path: ReadonlyArray<PositionedVisual>
): Array<PositionedVisual> => {
  if (path.length < 3) return []

  const first = path[0]
  const last = path[path.length - 1]
  const steps = path.length - 1

  return path.slice(1, -1).map((visual, index) => {
    const t = (index + 1) / steps

    return {
      id: visual.id,
      x: first.x + (last.x - first.x) * t,
      y: first.y + (last.y - first.y) * t,
    }
  })
}
