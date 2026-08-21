'use client'

import { AddElement } from '@/components/canvas/addStationModal/AddElement'
import { SubwayLoader } from '@/components/ui/SubwayLoader/SubwayLoader'
import type Konva from 'konva'
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Layer, Stage } from 'react-konva'
import { useMetroCanvas } from './hooks'
import { useMetroModal } from './hooks/useMetroModal'
import { MetroLabels } from './MetroLabels/MetroLabels'
import { MetroLines } from './MetroLines/MetroLines'
import { MetroStations } from './MetroStations/MetroStations'
import { useStageResize } from './shared/useStageResize'
import { useStageZoom } from './shared/useStageZoom'

export interface MetroCanvasRef {
  openAddStationModal: () => void
  getClickPosition: () => { x: number; y: number }
}

export const MetroCanvas = forwardRef<MetroCanvasRef>((_ref, _) => {
  const [isMounted, setIsMounted] = useState(false)
  const hasCenteredRef = useRef(false)

  const { visuals, stationNames, isLoaded, isInitializing, reloadData, setVisuals } =
    useMetroCanvas()

  const { isModalOpen, clickPosition, openModal, closeModal } = useMetroModal()
  const { width, height } = useStageResize()
  const { stageRef, stageScale, stagePosition, handleWheel, handleStageDragEnd, centerStage } =
    useStageZoom(0.1, 5, 1.1)

  const lineRef = useRef<Record<string, Konva.Line>>({})
  const circleRef = useRef<Record<string, Konva.Circle>>({})
  const textRef = useRef<Record<string, Konva.Text>>({})

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useLayoutEffect(() => {
    if (!isLoaded || hasCenteredRef.current) return

    const values = Object.values(visuals)
    if (values.length === 0) return

    centerStage(values, width, height)
    hasCenteredRef.current = true
  }, [isLoaded, visuals, centerStage, width, height])

  const handleDblClick = () => {
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

  const handleStationAdded = async () => {
    await reloadData()
  }

  if (!isLoaded || isInitializing) {
    return <SubwayLoader />
  }

  return (
    <>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onWheel={handleWheel}
        onDblClick={handleDblClick}
        draggable
        onDragEnd={handleStageDragEnd}
      >
        <Layer>
          <MetroLines visuals={visuals} lineRef={lineRef} />

          <MetroStations
            visuals={visuals}
            circleRef={circleRef}
            lineRef={lineRef}
            textRef={textRef}
            setVisuals={setVisuals}
          />

          <MetroLabels visuals={visuals} stationNames={stationNames} textRef={textRef} />
        </Layer>
      </Stage>

      {isMounted &&
        createPortal(
          <AddElement
            isOpen={isModalOpen}
            onClose={closeModal}
            position={clickPosition}
            onStationAdded={handleStationAdded}
          />,
          document.body
        )}
    </>
  )
})

MetroCanvas.displayName = 'MetroCanvas'
