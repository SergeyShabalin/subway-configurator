import type { SelectedSegment } from '@/components/canvas/MetroCanvas/MetroMapLayer/MetroLines/types'
import { useMetroStore } from '@/store'
import type { Line } from '@/types/metro'
import { useMemo } from 'react'

export const useCurrentLine = (selectedSegment: SelectedSegment | null): Line | null => {
  const lines = useMetroStore((state) => state.lines)

  return useMemo(() => {
    if (!selectedSegment) return null
    return lines.find((l) => String(l.id) === String(selectedSegment.lineId)) ?? null
  }, [lines, selectedSegment])
}
