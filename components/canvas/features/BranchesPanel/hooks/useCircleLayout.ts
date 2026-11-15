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

interface Session {
  lineId: string
  center: Point
  /** Позиции станций, к которым откатывает «Отменить» */
  before: Array<PositionedVisual>
  /** Окружность, сохранённая у линии на момент выбора или последнего сохранения */
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
  const [session, setSession] = useState<Session | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<CircleStatus>('idle')
  const [tooShort, setTooShort] = useState(false)

  const lineOptions = useMemo(
    () => lines.map((line) => buildLineMarkedOption(line.id, line.name, [line])),
    [lines]
  )

  /** Откатывает несохранённые изменения на карте и в сторе */
  const revert = () => {
    if (!session || !isDirty) return
    updateVisualPositions(session.before)
    updateLineCircle(session.lineId, session.previousCircle)
  }

  const selectLine = (id: string) => {
    revert()
    setSession(null)
    setIsDirty(false)
    setStatus('idle')
    setLineId(id)

    const line = lines.find((l) => l.id === id)
    if (!line) return

    const { visuals } = store.getState()
    const before: Array<PositionedVisual> = []
    for (const visualId of line.visualStationIds) {
      const v = visuals[visualId]
      if (v) before.push({ id: v.id, x: v.x, y: v.y })
    }

    const isTooShort = before.length < MIN_STATIONS
    setTooShort(isTooShort)
    if (isTooShort) return

    const center = line.circle?.center ?? getCentroid(before)
    setSession({ lineId: id, center, before, previousCircle: line.circle })
    setRadius(Math.round(line.circle?.radius ?? getMeanDistance(before, center)))
  }

  const changeRadius = (value: number) => {
    if (!session || !Number.isFinite(value)) return

    const next = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value))
    updateVisualPositions(arrangeOnCircle(session.before, session.center, next))
    updateLineCircle(session.lineId, { center: session.center, radius: next })
    setRadius(next)
    setIsDirty(true)
    setStatus('idle')
  }

  const save = async () => {
    if (!session) return

    const circle: LineCircle = { center: session.center, radius }
    const arranged = arrangeOnCircle(session.before, session.center, radius)

    setIsSaving(true)
    try {
      await visualsService.updatePositions(arranged)
      await linesService.setCircle(session.lineId, circle)
      setSession({ ...session, before: arranged, previousCircle: circle })
      setIsDirty(false)
      setStatus('saved')
    } catch {
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const cancel = () => {
    if (!session) return

    revert()
    setIsDirty(false)
    setStatus('idle')
    if (session.previousCircle) setRadius(Math.round(session.previousCircle.radius))
  }

  return {
    picker: { lineId, lineOptions, selectLine },
    radius: { value: radius, min: MIN_RADIUS, max: MAX_RADIUS, change: changeRadius },
    state: { isReady: session !== null, isDirty, isSaving, status, tooShort },
    actions: { save, cancel },
  }
}
