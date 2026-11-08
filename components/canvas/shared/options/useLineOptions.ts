import type { DropdownOption } from '@/components/ui/Dropdown'
import { useMetroStore } from '@/store'
import { useMemo } from 'react'
import { lineMarker } from './optionMarkers'

export const useLineOptions = () => {
  const lines = useMetroStore((state) => state.lines)

  return useMemo<Array<DropdownOption<string>>>(
    () => lines.map((line) => ({ value: line.id, label: line.name, leading: lineMarker([line]) })),
    [lines]
  )
}
