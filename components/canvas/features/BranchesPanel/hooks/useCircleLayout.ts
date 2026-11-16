import { buildLineMarkedOption } from '@/components/canvas/shared/options/lineOptionHelpers'
import type { PositionedVisual } from '@/src/lib/layout/alignStations'
import { arrangeOnCircle, getCentroid, getMeanDistance } from '@/src/lib/layout/arrangeOnCircle'
import { linesService, visualsService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import type { LineCircle, Point } from '@/types/metro'
import { useMemo, useState } from 'react'

const MIN_RADIUS = 30
const MAX_RADIUS = 3000
const MIN_STATIONS = 3

/** Состояние до первого несохранённого изменения: к нему откатывает «Отменить» */
interface Snapshot {
  before: Array<PositionedVisual>
  previousCircle: LineCircle | undefined
}

export type CircleStatus = 'idle' | 'saved' | 'error'

export const useCircleLayout = () => {
  const store = useMetroStoreApi()
  const lines = useMetroStore((s) => s.lines)
  const updateVisualPositions = useMetroStore((s) => s.updateVisualPositions)
  const updateLineCircle = useMetroStore((s) => s.updateLineCircle)

  const [lineId, setLineId] = useState('')
  const [radius, setRadius] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<CircleStatus>('idle')
  const [tooShort, setTooShort] = useState(false)

  const isDirty = snapshot !== null

  const lineOptions = useMemo(
    () => lines.map((line) => buildLineMarkedOption(line.id, line.name, [line])),
    [lines]
  )

  /** Актуальные позиции станций линии из стора */
  const readPositions = (id: string): Array<PositionedVisual> => {
    const { linesById, visuals } = store.getState()
    return (linesById[id]?.visualStationIds ?? []).flatMap((visualId) => {
      const v = visuals[visualId]
      return v ? [{ id: v.id, x: v.x, y: v.y }] : []
    })
  }

  const readCircle = (id: string): LineCircle | undefined => store.getState().linesById[id]?.circle

  const resolveCenter = (id: string, positions: ReadonlyArray<Point>): Point =>
    readCircle(id)?.center ?? getCentroid(positions)

  const revert = () => {
    if (!snapshot) return
    updateVisualPositions(snapshot.before)
    updateLineCircle(lineId, snapshot.previousCircle)
    setSnapshot(null)
  }

  const resolveRadius = (id: string): number => {
    const positions = readPositions(id)
    const circle = readCircle(id)
    return Math.round(circle?.radius ?? getMeanDistance(positions, resolveCenter(id, positions)))
  }

  const selectLine = (id: string) => {
    revert()
    setLineId(id)
    setStatus('idle')

    const isTooShort = readPositions(id).length < MIN_STATIONS
    setTooShort(isTooShort)
    setIsReady(!isTooShort)
    if (!isTooShort) setRadius(resolveRadius(id))
  }

  const changeRadius = (value: number) => {
    if (!isReady || !Number.isFinite(value)) return

    const positions = readPositions(lineId)
    if (!snapshot) setSnapshot({ before: positions, previousCircle: readCircle(lineId) })

    const next = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value))
    const center = resolveCenter(lineId, positions)

    updateVisualPositions(arrangeOnCircle(positions, center, next))
    updateLineCircle(lineId, { center, radius: next })
    setRadius(next)
    setStatus('idle')
  }

  const save = async () => {
    if (!isReady) return

    const positions = readPositions(lineId)
    const circle: LineCircle = { center: resolveCenter(lineId, positions), radius }

    setIsSaving(true)
    try {
      await visualsService.updatePositions(arrangeOnCircle(positions, circle.center, radius))
      await linesService.setCircle(lineId, circle)
      setSnapshot(null)
      setStatus('saved')
    } catch {
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const cancel = () => {
    if (!snapshot) return

    revert()
    setStatus('idle')
    setRadius(resolveRadius(lineId))
  }

  return {
    picker: { lineId, lineOptions, selectLine },
    radius: { value: radius, min: MIN_RADIUS, max: MAX_RADIUS, change: changeRadius },
    state: { isReady, isDirty, isSaving, status, tooShort },
    actions: { save, cancel },
  }
}
