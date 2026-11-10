'use client'

import { HintLetsStarted } from '@/components/canvas/MetroCanvas/HintLetsStarted/HintLetsStarted'
import { useMetroLoader } from '@/components/canvas/MetroCanvas/hooks/useMetroLoader'
import { SubwayLoader } from '@/components/ui/SubwayLoader/SubwayLoader'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useRef } from 'react'
import { Stage } from 'react-konva'
import { useMetroCanvas } from '../hooks'
import { useCanvasContextMenu } from './hooks/useCanvasContextMenu'
import { useCanvasSelection } from './hooks/useCanvasSelection'
import { useCanvasViewport } from './hooks/useCanvasViewport'
import styles from './MetroCanvas.module.css'
import { MetroCanvasDialogs } from './MetroCanvasDialogs/MetroCanvasDialogs'
import { MetroMapLayer } from './MetroMapLayer/MetroMapLayer'

export const MetroCanvas = () => {
  const hasStations = useMetroStore((state) => Object.keys(state.visuals).length > 0)
  const hasLines = useMetroStore((state) => state.lines.length > 0)

  const { isLoaded, isInitializing, reloadData } = useMetroCanvas()
  const isBusy = !isLoaded || isInitializing
  const { showLoader } = useMetroLoader(isBusy)

  const selection = useCanvasSelection()

  const stageRefForMenu = useRef<Konva.Stage | null>(null)

  const { modal, handleContextMenu, handleLongPress } = useCanvasContextMenu(stageRefForMenu)

  const { width, height, stageRef, stageHandlers } = useCanvasViewport({
    isLoaded,
    isBusy,
    onLongPress: handleLongPress,
  })

  const setStageRefs = (stage: Konva.Stage | null) => {
    stageRef.current = stage
    stageRefForMenu.current = stage
  }

  if (isBusy) return showLoader ? <SubwayLoader /> : null

  return (
    <div className={styles.container} style={{ width, height }}>
      <Stage
        ref={setStageRefs}
        width={width}
        height={height}
        onContextMenu={handleContextMenu}
        draggable
        {...stageHandlers}
      >
        <MetroMapLayer selection={selection} />
      </Stage>

      {!hasStations && <HintLetsStarted hasLines={hasLines} />}

      <MetroCanvasDialogs modal={modal} selection={selection} reloadData={reloadData} />
    </div>
  )
}
