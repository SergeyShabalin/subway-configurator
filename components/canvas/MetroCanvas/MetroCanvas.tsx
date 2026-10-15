'use client'

import { AddElementModal } from '@/components/canvas/features'
import { ChangeElementModal } from '@/components/canvas/features/ChangeElementModal/ChangeElementModal'
import { HintLetsStarted } from '@/components/canvas/MetroCanvas/HintLetsStarted/HintLetsStarted'
import { useInitialCenterCanvas } from '@/components/canvas/MetroCanvas/hooks/useInitialCenterCanvas'
import { useMetroLoader } from '@/components/canvas/MetroCanvas/hooks/useMetroLoader'
import { useStationSelection } from '@/components/canvas/MetroCanvas/hooks/useStationSelection'
import { MetroTransfers } from '@/components/canvas/MetroCanvas/MetroTransfers/MetroTransfers'
import { SubwayLoader } from '@/components/ui/SubwayLoader/SubwayLoader'
import { stationsService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { forwardRef, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Layer, Stage } from 'react-konva'
import { useMetroCanvas } from '../hooks'
import { useMetroModal } from '../hooks/useMetroModal'
import { useStageResize } from '../shared/useStageResize'
import { useStageZoom } from '../shared/useStageZoom'
import styles from './MetroCanvas.module.css'
import { MetroLabels } from './MetroLabels/MetroLabels'
import { useMetroLines } from './MetroLines/hooks/useMetroLines'
import { MetroLines } from './MetroLines/MetroLines'
import { MetroStations } from './MetroStations/MetroStations'

export interface MetroCanvasRef {
  openAddStationModal: () => void
  getClickPosition: () => { x: number; y: number }
}

export const MetroCanvas = forwardRef<MetroCanvasRef>((_ref, _) => {
  const lineRef = useRef<Record<string, Konva.Line>>({})
  const circleRef = useRef<Record<string, Konva.Circle>>({})
  const textRef = useRef<Record<string, Konva.Text>>({})

  const visuals = useMetroStore((state) => state.visuals)
  const stations = useMetroStore((state) => state.stations)
  const updateVisualLabelOffset = useMetroStore((state) => state.updateVisualLabelOffset)

  const { isLoaded, isInitializing, reloadData } = useMetroCanvas()

  const { selectedStationId, selectStation, clearSelection } = useStationSelection()

  const isBusy = !isLoaded || isInitializing
  const { isMounted, showLoader } = useMetroLoader(isBusy)

  const { isModalOpen, clickPosition, openModal, closeModal } = useMetroModal()

  const { width, height } = useStageResize()

  const { stageRef, stageScale, stagePosition, handleWheel, handleStageDragEnd, centerStage } =
    useStageZoom(0.1, 5, 1.1)

  useInitialCenterCanvas({ isLoaded, visuals, width, height, centerStage })

  const stationNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const station of stations) {
      map[station.id] = station.name
    }
    return map
  }, [stations])

  const { lineData } = useMetroLines()

  const hasLines = lineData.length > 0
  const hasStations = Object.keys(visuals).length > 0
  const showHint = !hasStations

  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const worldPos = {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    }
    openModal(worldPos.x, worldPos.y)
  }

  const handleDataReload = useCallback(async () => {
    await reloadData()
  }, [reloadData])

  const handleLabelMove = useCallback(
    async (visualId: string, x: number, y: number) => {
      const visual = visuals[visualId]
      if (!visual) return

      const labelX = x - visual.x
      const labelY = y - visual.y

      console.log('[handleLabelMove]', { visualId, x, y, labelX, labelY })

      updateVisualLabelOffset(visualId, labelX, labelY)
      await stationsService.updateLabelPosition(visualId, labelX, labelY)
    },
    [visuals, updateVisualLabelOffset]
  )

  const initialTab = hasLines ? 'station' : 'line'

  const addElementModal = useMemo(
    () => (
      <AddElementModal
        key={isModalOpen ? 'open' : 'closed'}
        isOpen={isModalOpen}
        onClose={closeModal}
        position={clickPosition}
        initialTab={initialTab}
        onAdded={handleDataReload}
      />
    ),
    [isModalOpen, closeModal, clickPosition, initialTab, handleDataReload]
  )

  const changeElementModal = useMemo(
    () => (
      <ChangeElementModal
        isOpen={selectedStationId !== null}
        onClose={clearSelection}
        stationId={selectedStationId}
        onSuccess={handleDataReload}
      />
    ),
    [selectedStationId, clearSelection, handleDataReload]
  )

  if (isBusy && showLoader) {
    return <SubwayLoader />
  }

  if (isBusy) {
    return null
  }

  return (
    <div className={styles.container} style={{ width, height }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        draggable
        onDragEnd={handleStageDragEnd}
      >
        <Layer>
          <MetroLines visuals={visuals} lineRef={lineRef} />
          <MetroTransfers visuals={visuals} />

          <MetroStations
            circleRef={circleRef}
            lineRef={lineRef}
            textRef={textRef}
            onStationDoubleClick={selectStation}
          />

          <MetroLabels
            stationNames={stationNames}
            textRef={textRef}
            onLabelMove={handleLabelMove}
          />
        </Layer>
      </Stage>

      {showHint && <HintLetsStarted hasLines={hasLines} />}

      {isMounted &&
        createPortal(
          <>
            {addElementModal}
            {changeElementModal}
          </>,
          document.body
        )}
    </div>
  )
})

MetroCanvas.displayName = 'MetroCanvas'
