import { lineMarker } from '@/components/canvas/shared/options/optionMarkers'
import type { DropdownOption } from '@/components/ui/Dropdown'
import type { Line, Station } from '@/types/metro'

interface Params {
  line: Line
  stations: ReadonlyArray<Station>
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
  visualIds: ReadonlyArray<string>
}

export const buildAlignOptions = ({
  line,
  stations,
  visualToStations,
  visualIds,
}: Params): Array<DropdownOption<string>> => {
  const names = new Map(stations.map((station) => [String(station.id), station.name]))
  const leading = lineMarker([line])

  return visualIds.map((visualId, index) => ({
    value: visualId,
    label: `${index + 1}. ${names.get(String(visualToStations[visualId]?.[0])) ?? visualId}`,
    leading,
  }))
}
