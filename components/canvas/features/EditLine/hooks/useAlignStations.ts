'use client'

import type { DropdownOption } from '@/components/ui/Dropdown'
import {
  alignOnStraightLine,
  getPathBetween,
  type PositionedVisual,
} from '@/src/lib/layout/alignStations'
import { visualsService } from '@/src/lib/services'
import { useMetroStore, useMetroStoreApi } from '@/store'
import type { Line } from '@/types/metro'
import { useCallback, useMemo, useState } from 'react'

export type AlignStatus = 'idle' | 'done' | 'error'
export type AlignProblem = 'sameStation' | 'noBetween' | null

interface Alignment {
  before: Array<PositionedVisual>
  after: Array<PositionedVisual>
}

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

  const options = useMemo<Array<DropdownOption<string>>>(() => {
    const names = new Map(stations.map((station) => [String(station.id), station.name]))

    return visualIds.map((visualId, index) => ({
      value: visualId,
      label: `${index + 1}. ${names.get(String(visualToStations[visualId]?.[0])) ?? visualId}`,
      colors: [line.color],
    }))
  }, [stations, visualToStations, visualIds, line.color])

  const path = useMemo(
    () => getPathBetween(visualIds, startId, endId, isCircular),
    [visualIds, startId, endId, isCircular]
  )

  // Пересадочные станции общие с другими линиями: при выравнивании сдвинутся и те линии
  const sharedCount = useMemo(
    () => path.slice(1, -1).filter((id) => (visualToStations[id]?.length ?? 0) > 1).length,
    [path, visualToStations]
  )

  const hasSelection = Boolean(startId && endId)
  const problem: AlignProblem =
    hasSelection && startId === endId
      ? 'sameStation'
      : hasSelection && path.length < 3
        ? 'noBetween'
        : null

  const selectStart = useCallback((id: string) => {
    setStartId(id)
    setStatus('idle')
  }, [])

  const selectEnd = useCallback((id: string) => {
    setEndId(id)
    setStatus('idle')
  }, [])

  const align = useCallback(async () => {
    // Координаты берём из стора в момент нажатия, чтобы не перерисовывать вкладку при каждом движении станций
    const { visuals } = store.getState()

    const positioned = path
      .map((id) => visuals[id])
      .filter(Boolean)
      .map((visual) => ({ id: visual.id, x: visual.x, y: visual.y }))

    if (positioned.length !== path.length) return

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
  }, [store, path, updateVisualPositions])

  const undo = useCallback(async () => {
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
  }, [lastAlignment, updateVisualPositions])

  return {
    options,
    startId,
    endId,
    selectStart,
    selectEnd,
    status,
    alignedCount: lastAlignment?.after.length ?? 0,
    sharedCount,
    problem,
    canAlign: path.length >= 3 && !isSaving,
    canUndo: lastAlignment !== null && !isSaving,
    isSaving,
    isCircular,
    align,
    undo,
  }
}
