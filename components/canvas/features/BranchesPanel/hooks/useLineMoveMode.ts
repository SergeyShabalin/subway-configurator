import { useMetroStore } from '@/store'
import { useEffect } from 'react'

export const useLineMoveMode = (lineId: string, enabled: boolean) => {
  const setMovableLineId = useMetroStore((state) => state.setMovableLineId)

  useEffect(() => {
    setMovableLineId(enabled && lineId ? lineId : null)
    return () => setMovableLineId(null)
  }, [lineId, enabled, setMovableLineId])
}
