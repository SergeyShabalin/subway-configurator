'use client'

import { alignOnAxis, getPathBetween, type AlignAxis } from '@/src/lib/layout/alignStations'
import { visualsService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import type { Line } from '@/types/metro'
import { useMemo, useState } from 'react'
import { buildAlignOptions } from '../helpers/buildAlignOptions'
import { countSharedStations } from '../helpers/countSharedStations'
import { getPositionedPath } from '../helpers/getPositionedPath'
import { resolveAlignProblem } from '../helpers/resolveAlignProblem'
import type { Alignment, AlignStatus } from '../types'

interface UseAlignStationsParams {
  line: Line
  /** Снаружи выравнивание запрещено (например, есть несохранённые правки окружности) */
  isLocked: boolean
}

export const useAlignStations = ({ line, isLocked }: UseAlignStationsParams) => {
  const store = useMetroStoreApi()
  const stations = useMetroStore((state) => state.stations)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const updateVisualPositions = useMetroStore((state) => state.updateVisualPositions)

  const [startId, setStartId] = useState('')
  const [endId, setEndId] = useState('')
  const [axis, setAxis] = useState<AlignAxis>('free')
  const [equalSpacing, setEqualSpacing] = useState(true)
  const [status, setStatus] = useState<AlignStatus>('idle')
  const [lastAlignment, setLastAlignment] = useState<Alignment | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const visualIds = useMemo(() => line.visualStationIds ?? [], [line.visualStationIds])
  const isCircular = line.is_circular === 1

  const options = useMemo(
    () => buildAlignOptions({ line, stations, visualToStations, visualIds }),
    [line, stations, visualToStations, visualIds]
  )

  const path = useMemo(
    () => getPathBetween(visualIds, startId, endId, isCircular),
    [visualIds, startId, endId, isCircular]
  )

  const sharedCount = useMemo(
    () => countSharedStations(path, visualToStations),
    [path, visualToStations]
  )

  const problem = resolveAlignProblem(startId, endId, path.length)

  const selectStart = (id: string) => {
    setStartId(id)
    setStatus('idle')
  }

  const selectEnd = (id: string) => {
    setEndId(id)
    setStatus('idle')
  }

  /** Повторный выбор той же оси снимает её. Вертикаль и горизонталь взаимоисключающие */
  const toggleAxis = (target: Exclude<AlignAxis, 'free'>) => {
    setAxis((current) => (current === target ? 'free' : target))
    setStatus('idle')
  }

  const toggleEqualSpacing = () => {
    setEqualSpacing((enabled) => !enabled)
    setStatus('idle')
  }

  const hasEffect = axis !== 'free' || equalSpacing

  const align = async () => {
    // Координаты берём из стора в момент нажатия, чтобы не перерисовывать вкладку при каждом движении станций
    const positioned = getPositionedPath(path, store.getState().visuals)
    if (!positioned) return

    const after = alignOnAxis(positioned, axis, equalSpacing)
    if (after.length === 0) return

    // Без оси крайние станции не двигаются, с осью двигаются все станции пути
    const before = axis === 'free' ? positioned.slice(1, -1) : positioned

    setIsSaving(true)
    setStatus('idle')
    updateVisualPositions(after) // сразу на карте, сохранение идёт следом

    try {
      await visualsService.updatePositions(after)
      setLastAlignment({ before, after })
      setStatus('done')
    } catch {
      updateVisualPositions(before)
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const undo = async () => {
    if (!lastAlignment) return

    setIsSaving(true)
    updateVisualPositions(lastAlignment.before)

    try {
      await visualsService.updatePositions(lastAlignment.before)
      setLastAlignment(null)
      setStatus('idle')
    } catch {
      updateVisualPositions(lastAlignment.after)
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isCircular,
    picker: { options, startId, endId, selectStart, selectEnd, isDisabled: isSaving || isLocked },
    axis: {
      value: axis,
      toggle: toggleAxis,
      equalSpacing,
      toggleEqualSpacing,
      isDisabled: isSaving || isLocked,
    },
    feedback: {
      problem,
      sharedCount,
      status,
      alignedCount: lastAlignment?.after.length ?? 0,
    },
    controls: {
      canAlign: path.length >= 3 && hasEffect && !isSaving && !isLocked,
      canUndo: lastAlignment !== null && !isSaving && !isLocked,
      isSaving,
      align,
      undo,
    },
  }
}
