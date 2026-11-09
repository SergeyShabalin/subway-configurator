import { useRouteFocus } from '@/components/canvas/features/RoutePanel/hooks/useRouteFocus'
import { useInitialCenterCanvas } from '@/components/canvas/MetroCanvas/hooks/useInitialCenterCanvas'
import { useTouchGestures } from '@/components/canvas/MetroCanvas/hooks/useTouchGestures'
import { setStage } from '@/src/lib/stageRegistry/stageRegistry'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useStageResize } from '../../shared/useStageResize'
import { useStageZoom } from '../../shared/useStageZoom'

const MIN_SCALE = 0.05
const MAX_SCALE = 20
const SCALE_STEP = 1.1
/** Ниже этого масштаба подписи скрываются. Поставить 0, чтобы отключить. */
const LABELS_MIN_SCALE = 0.35

interface Params {
  isLoaded: boolean
  isBusy: boolean
  onLongPress: (worldX: number, worldY: number) => void
}

/** Камера: размер сцены, зум, жесты, начальное центрирование, регистрация сцены. */
export const useCanvasViewport = ({ isLoaded, isBusy, onLongPress }: Params) => {
  const visuals = useMetroStore((state) => state.visuals)
  const { width, height } = useStageResize()

  const labelsRef = useRef<Konva.Group>(null)

  const handleScaleChange = useCallback((scale: number) => {
    const group = labelsRef.current
    if (!group) return

    const show = scale >= LABELS_MIN_SCALE
    if (group.visible() !== show) group.visible(show)
  }, [])

  const {
    stageRef,
    handleWheel,
    zoomAt,
    panBy,
    beginInteraction,
    endInteraction,
    refreshHitGraph,
    centerStage,
  } = useStageZoom(MIN_SCALE, MAX_SCALE, SCALE_STEP, handleScaleChange)

  useInitialCenterCanvas({ isLoaded, visuals, width, height, centerStage })
  useRouteFocus(centerStage, width, height)

  useTouchGestures({
    stageRef,
    onLongPress,
    zoomAt,
    panBy,
    flush: endInteraction,
    enabled: !isBusy,
  })

  useLayoutEffect(() => {
    if (!isBusy) refreshHitGraph()
  }, [visuals, isBusy, refreshHitGraph])

  useEffect(() => {
    setStage(stageRef.current)
    return () => setStage(null)
  }, [isBusy, stageRef])

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target === e.target.getStage()) {
      beginInteraction()
    }
  }

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target === e.target.getStage()) {
      endInteraction()
    }
  }

  return {
    width,
    height,
    stageRef,
    stageHandlers: {
      onWheel: handleWheel,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  }
}
