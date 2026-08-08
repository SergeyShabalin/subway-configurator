import type { VisualStation } from '@/store'
import { useEffect, useRef } from 'react'

export function useVisualsRef(visuals: Record<string, VisualStation>) {
  const visualsRef = useRef(visuals)

  useEffect(() => {
    visualsRef.current = visuals
  }, [visuals])

  return visualsRef
}
