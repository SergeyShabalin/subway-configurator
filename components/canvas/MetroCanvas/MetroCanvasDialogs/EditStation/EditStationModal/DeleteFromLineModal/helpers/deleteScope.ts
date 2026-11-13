import { buildLineMarkedOption } from '@/components/canvas/shared/options/lineOptionHelpers'
import type { DropdownOption } from '@/components/ui/Dropdown'
import type { DeleteScope, LineOption } from '../../../types'

export const DELETE_ALL = '__all__'

export const getInitialSelection = (
  options: ReadonlyArray<LineOption>,
  defaultStationId: string | null
): string =>
  options.find((o) => o.stationId === defaultStationId)?.stationId ??
  options[0]?.stationId ??
  DELETE_ALL

export const toDeleteScope = (selected: string): DeleteScope =>
  selected === DELETE_ALL ? { type: 'all' } : { type: 'line', stationId: selected }

export const buildDeleteScopeOptions = (
  options: ReadonlyArray<LineOption>,
  allLabel: string
): Array<DropdownOption<string>> => [
  ...options.map(({ stationId, line }) => buildLineMarkedOption(stationId, line.name, [line])),
  // «Со всех линий»: значки всех линий узла
  buildLineMarkedOption(
    DELETE_ALL,
    allLabel,
    options.map(({ line }) => line)
  ),
]
