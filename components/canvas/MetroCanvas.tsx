'use client'

import { MetroLabels } from '@/components/canvas/MetroLabels/MetroLabels'
import { MetroLines } from '@/components/canvas/MetroLines/MetroLines'
import { MetroStations } from '@/components/canvas/MetroStations/MetroStations'
import { useStageResize } from '@/components/canvas/hooks/useStageResize'
import { useStageZoom } from '@/components/canvas/hooks/useStageZoom'
import { MetroLoader } from '@/components/ui/loader/MetroLoader'
import type { VisualStation } from '@/store'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Layer, Stage } from 'react-konva'
import { ApiResponse } from './types'

export const MetroCanvas = () => {
  const { loadData } = useMetroStore()
  const [visuals, setVisuals] = useState<Record<string, VisualStation>>({})
  const [stationNames, setStationNames] = useState<Record<string, string>>({})
  const [isLoaded, setIsLoaded] = useState(false)

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

  useEffect(() => {
    const init = async () => {
      try {
        await loadData()

        const response = await fetch('/api/graph')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = (await response.json()) as ApiResponse

        const map: Record<string, VisualStation> = {}
        for (const v of data.visuals) {
          map[v.id] = {
            id: v.id,
            x: v.x,
            y: v.y,
            labelOffset: v.labelOffset,
            isTransfer: v.isTransfer,
          }
        }
        setVisuals(map)

        const names: Record<string, string> = {}
        for (const station of data.stations) {
          names[station.id] = station.name
        }
        setStationNames(names)

        setTimeout(() => {
          setIsLoaded(true)
        }, 2600)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    init()
  }, [loadData])

  useLayoutEffect(() => {
    if (!isLoaded || hasCenteredRef.current) return

    const values = Object.values(visuals)
    if (values.length === 0) return

    centerStage(values, width, height)
    hasCenteredRef.current = true // НЕТ setState!
  }, [isLoaded, visuals, centerStage, width, height])

  if (!isLoaded) {
    return <MetroLoader />
  }

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePosition.x}
      y={stagePosition.y}
      onWheel={handleWheel}
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
  )
}
