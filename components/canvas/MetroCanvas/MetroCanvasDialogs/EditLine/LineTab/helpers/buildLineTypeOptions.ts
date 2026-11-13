import type { DropdownOption } from '@/components/ui/Dropdown'
import type { LineType } from '@/types/metro'

export const buildLineTypeOptions = (
  t: (key: string) => string
): Array<DropdownOption<LineType>> => [
  { value: 'subway', label: t('typeSubway') },
  { value: 'commuter_rail', label: t('typeCommuterRail') },
]
