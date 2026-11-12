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
): Array<DropdownOption<string>> => {
  const lineItems = options.map((option) => ({
    value: option.stationId,
    label: option.lineName,
    color: option.lineColor,
  }))

  return [...lineItems, { value: DELETE_ALL, label: allLabel }]
}
