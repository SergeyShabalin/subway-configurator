'use client'

import { MetroLabels } from '@/components/canvas/MetroLabels/MetroLabels'
import { MetroLines } from '@/components/canvas/MetroLines/MetroLines'
import { MetroStations } from '@/components/canvas/MetroStations/MetroStations'
import { AddElement } from '@/components/canvas/addStationModal/AddElement'
import { useStageResize } from '@/components/canvas/hooks/useStageResize'
import { useStageZoom } from '@/components/canvas/hooks/useStageZoom'
import { SubwayLoader } from '@/components/ui/SubwayLoader/SubwayLoader'
import type { GraphData } from '@/lib/api'
import { graphService } from '@/lib/services'
import type { VisualStation } from '@/store'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Layer, Stage } from 'react-konva'

export interface MetroCanvasRef {
  openAddStationModal: () => void
  getClickPosition: () => { x: number; y: number }
}

const transformApiData = (data: GraphData) => {
  const visualsMap: Record<string, VisualStation> = {}
  for (const v of data.visuals) {
    visualsMap[v.id] = {
      id: v.id,
      x: v.x,
      y: v.y,
      labelOffset: v.labelOffset,
      isTransfer: v.isTransfer,
    }
  }

  const namesMap: Record<string, string> = {}
  for (const station of data.stations) {
    namesMap[station.id] = station.name
  }

  return { visualsMap, namesMap }
}

export const MetroCanvas = forwardRef<MetroCanvasRef>((_ref, _) => {
  const { loadData } = useMetroStore()
  const [visuals, setVisuals] = useState<Record<string, VisualStation>>({})
  const [stationNames, setStationNames] = useState<Record<string, string>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)

  const hasCenteredRef = useRef(false)

  const { width, height } = useStageResize()
  const { stageRef, stageScale, stagePosition, handleWheel, handleStageDragEnd, centerStage } =
    useStageZoom({
      minScale: 0.1,
      maxScale: 5,
      scaleStep: 1.1,
    })

  const lineRef = useRef<Record<string, Konva.Line>>({})
  const circleRef = useRef<Record<string, Konva.Circle>>({})
  const textRef = useRef<Record<string, Konva.Text>>({})

  const loadAndUpdateData = async (): Promise<void> => {
    const data = await graphService.getGraph()
    const { visualsMap, namesMap } = transformApiData(data)
    setVisuals(visualsMap)
    setStationNames(namesMap)
  }

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    const init = async (): Promise<void> => {
      await loadData()
      await loadAndUpdateData()

      setTimeout(() => {
        setIsLoaded(true)
      }, 2600)
    }

    init()
  }, [loadData])

  useLayoutEffect(() => {
    if (!isLoaded || hasCenteredRef.current) return

    const values = Object.values(visuals)
    if (values.length === 0) return

    centerStage(values, width, height)
    hasCenteredRef.current = true
  }, [isLoaded, visuals, centerStage, width, height])

  const handleDblClick = (_event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const worldPos = {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    }

    setClickPosition(worldPos)
    setIsModalOpen(true)
  }

  const handleStationAdded = async (): Promise<void> => {
    await loadAndUpdateData()
  }

  if (!isLoaded) {
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
            onClose={() => setIsModalOpen(false)}
            position={clickPosition}
            onStationAdded={handleStationAdded}
          />,
          document.body
        )}
    </>
  )
})

MetroCanvas.displayName = 'MetroCanvas'
