'use client'

import { AddElementModal } from '@/components/canvas/features'
import { ChangeElementModal } from '@/components/canvas/features/ChangeElementModal/ChangeElementModal'
import { MouseRightClickIcon } from '@/components/ui/Icons/MouseRightClickIcon/MouseRightClickIcon'
import { SubwayLoader } from '@/components/ui/SubwayLoader/SubwayLoader'
import type Konva from 'konva'
import { useTranslations } from 'next-intl'
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Layer, Stage } from 'react-konva'
import { useMetroCanvas } from './hooks'
import { useMetroModal } from './hooks/useMetroModal'
import styles from './MetroCanvas.module.css'
import { MetroLabels } from './MetroLabels/MetroLabels'
import { useMetroLines } from './MetroLines/hooks/useMetroLines'
import { MetroLines } from './MetroLines/MetroLines'
import { MetroStations } from './MetroStations/MetroStations'
import { useStageResize } from './shared/useStageResize'
import { useStageZoom } from './shared/useStageZoom'

export interface MetroCanvasRef {
  openAddStationModal: () => void
  getClickPosition: () => { x: number; y: number }
}

export const MetroCanvas = forwardRef<MetroCanvasRef>((_ref, _) => {
  const t = useTranslations('MetroCanvas')

  const [isMounted, setIsMounted] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const hasCenteredRef = useRef(false)

  const { visuals, stationNames, isLoaded, isInitializing, reloadData, setVisuals } =
    useMetroCanvas()

  const { lineData } = useMetroLines()

  const hasLines = lineData.length > 0
  const hasStations = Object.keys(visuals).length > 0
  const showHint = !hasStations

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

  const handleStationDoubleClick = useCallback((stationId: string) => {
    setSelectedStationId(stationId)
  }, [])

  const handleChangeModalClose = useCallback(() => {
    setSelectedStationId(null)
  }, [])

  const initialTab = hasLines ? 'station' : 'line'

  const addElementModal = useMemo(
    () => (
      <AddElementModal
        key={isModalOpen ? 'open' : 'closed'}
        isOpen={isModalOpen}
        onClose={closeModal}
        position={clickPosition}
        initialTab={initialTab}
        onStationAdded={handleDataReload}
        onLineAdded={handleDataReload}
      />
    ),
    [isModalOpen, closeModal, clickPosition, initialTab, handleDataReload]
  )

  const changeElementModal = useMemo(
    () => (
      <ChangeElementModal
        isOpen={selectedStationId !== null}
        onClose={handleChangeModalClose}
        stationId={selectedStationId}
        onSuccess={handleDataReload}
      />
    ),
    [selectedStationId, handleChangeModalClose, handleDataReload]
  )

  if (!isLoaded || isInitializing) {
    return <SubwayLoader />
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

          <MetroStations
            visuals={visuals}
            circleRef={circleRef}
            lineRef={lineRef}
            textRef={textRef}
            setVisuals={setVisuals}
            onStationDoubleClick={handleStationDoubleClick}
          />

          <MetroLabels visuals={visuals} stationNames={stationNames} textRef={textRef} />
        </Layer>
      </Stage>

      {showHint && (
        <div className={styles.hint}>
          <MouseRightClickIcon className={styles.icon} />

          {hasLines ? (
            <>
              <div className={styles.title}>{t('hintNoStationsTitle')}</div>

              <div className={styles.text}>{t('hintNoStationsText')}</div>
            </>
          ) : (
            <>
              <div className={styles.title}>{t('hintNoLinesTitle')}</div>

              <div className={styles.text}>{t('hintNoLinesText')}</div>
            </>
          )}
        </div>
      )}

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
