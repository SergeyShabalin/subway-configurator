import { VisualData } from '@/components/canvas/MetroCanvas/MetroStations/types'
import { useLayoutEffect, useRef } from 'react'

/**
 * Центрирует всю структуру метро на канвасе.
 *
 * Ждёт загрузки данных и появления визуалов, затем вызывает `centerStage`,
 * чтобы вписать всю карту метро в видимую область. Повторные рендеры
 * пропускаются через `hasCenteredRef`, чтобы не сбрасывать ручное
 * перемещение пользователя.
 */

interface UseInitialCenterParams {
  isLoaded: boolean
  visuals: Record<string, VisualData>
  width: number
  height: number
  centerStage: (visuals: Array<VisualData>, width: number, height: number) => void
}

const useInitialCenterCanvas = ({
  isLoaded,
  visuals,
  width,
  height,
  centerStage,
}: UseInitialCenterParams) => {
  const hasCenteredRef = useRef(false)

  useLayoutEffect(() => {
    if (!isLoaded || hasCenteredRef.current) return

    const values = Object.values(visuals)

    if (values.length === 0) return

    centerStage(values, width, height)
    hasCenteredRef.current = true
  }, [isLoaded, visuals, centerStage, width, height])
}

export { useInitialCenterCanvas }
