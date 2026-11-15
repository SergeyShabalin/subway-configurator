import { useRouteFocus } from '@/components/canvas/features/RoutePanel/hooks/useRouteFocus'
import { useInitialCenterCanvas } from '@/components/canvas/MetroCanvas/hooks/useCanvasViewport/useInitialCenterCanvas/useInitialCenterCanvas'
import { useTouchGestures } from '@/components/canvas/MetroCanvas/hooks/useTouchGestures'
import { DOCKED_MEDIA_QUERY } from '@/components/ui/Sidebar/constants'
import { setStage } from '@/src/lib/stageRegistry/stageRegistry'
import { useMetroStore } from '@/store'
import type Konva from 'konva'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useStageResize } from './useStageResize/useStageResize'
import { useStageZoom } from './useStageZoom/useStageZoom'

const MIN_SCALE = 0.05
const MAX_SCALE = 20
const SCALE_STEP = 1.1
/** Ниже этого масштаба подписи скрываются. Поставить 0, чтобы отключить. */
const LABELS_MIN_SCALE = 0.35

/** Ширина области слева, закрытой сайдбаром и панелью: маршрут центрируется правее неё. */
const ROUTE_FOCUS_INSET_LEFT = 799
/** Доля высоты экрана, которую занимает нижняя панель (max-height: 45dvh в SidebarPanel). */
const ROUTE_FOCUS_PANEL_HEIGHT_RATIO = 0.45
/** Высота тулбара с отступами снизу. */
const ROUTE_FOCUS_TOOLBAR_HEIGHT = 115
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

  // Центрирует в свободной области: на десктопе правее сайдбара, на телефоне выше нижней панели
  const centerStageRight = useCallback(
    (points: Array<{ x: number; y: number }>, stageWidth: number, stageHeight: number) => {
      const isDocked = window.matchMedia(DOCKED_MEDIA_QUERY).matches

      if (isDocked) {
        const insetBottom = Math.min(
          stageHeight * ROUTE_FOCUS_PANEL_HEIGHT_RATIO + ROUTE_FOCUS_TOOLBAR_HEIGHT,
          stageHeight / 2
        )

        // Свободная область начинается с верха холста: сдвигать сцену не нужно
        centerStage(points, stageWidth, stageHeight - insetBottom)
        return
      }

      const inset = Math.min(ROUTE_FOCUS_INSET_LEFT, stageWidth / 2)

      centerStage(points, stageWidth - inset, stageHeight)

      const stage = stageRef.current
      if (stage) stage.x(stage.x() + inset)
    },
    [centerStage, stageRef]
  )
  useInitialCenterCanvas({ isLoaded, visuals, width, height, centerStage })
  useRouteFocus(centerStageRight, width, height)

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
