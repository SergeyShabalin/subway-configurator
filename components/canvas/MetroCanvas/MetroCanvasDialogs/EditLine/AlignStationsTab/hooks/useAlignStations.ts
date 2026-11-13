'use client'

import {
  Alignment,
  AlignStatus,
} from '@/components/canvas/MetroCanvas/MetroCanvasDialogs/EditLine/AlignStationsTab/types'
import { alignOnStraightLine, getPathBetween } from '@/src/lib/layout/alignStations'
import { visualsService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import type { Line } from '@/types/metro'
import { useMemo, useState } from 'react'
import { buildAlignOptions } from '../helpers/buildAlignOptions'
import { countSharedStations } from '../helpers/countSharedStations'
import { getPositionedPath } from '../helpers/getPositionedPath'
import { resolveAlignProblem } from '../helpers/resolveAlignProblem'

export const useAlignStations = (line: Line) => {
  const store = useMetroStoreApi()
  const stations = useMetroStore((state) => state.stations)
  const visualToStations = useMetroStore((state) => state.visualToStations)
  const updateVisualPositions = useMetroStore((state) => state.updateVisualPositions)

  const [startId, setStartId] = useState('')
  const [endId, setEndId] = useState('')
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

  const align = async () => {
    // Координаты берём из стора в момент нажатия, чтобы не перерисовывать вкладку при каждом движении станций
    const positioned = getPositionedPath(path, store.getState().visuals)
    if (!positioned) return

    const after = alignOnStraightLine(positioned)
    if (after.length === 0) return

    const before = positioned.slice(1, -1)

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
    picker: { options, startId, endId, selectStart, selectEnd, isDisabled: isSaving },
    feedback: {
      problem,
      sharedCount,
      status,
      alignedCount: lastAlignment?.after.length ?? 0,
    },
    controls: {
      canAlign: path.length >= 3 && !isSaving,
      canUndo: lastAlignment !== null && !isSaving,
      isSaving,
      align,
      undo,
    },
  }
}
