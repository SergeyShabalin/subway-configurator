import type { DropdownOption } from '@/components/ui/Dropdown'
import type { Line } from '@/types/metro'
import { lineMarker } from './optionMarkers'

/** Опция выпадающего списка со значками переданных линий */
export const buildLineMarkedOption = <T extends string>(
  value: T,
  label: string,
  lines: ReadonlyArray<Line>
): DropdownOption<T> => ({
  value,
  label,
  leading: lineMarker(lines),
})
