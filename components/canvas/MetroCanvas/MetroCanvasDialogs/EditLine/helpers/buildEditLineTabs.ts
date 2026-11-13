import type { EditLineTabItem } from '../types'

export const buildEditLineTabs = (
  hasSegment: boolean,
  t: (key: string) => string
): Array<EditLineTabItem> => [
  { value: 'line', label: t('tabLine') },
  ...(hasSegment ? [{ value: 'segment' as const, label: t('tabSegment') }] : []),
  { value: 'stations', label: t('tabStations') },
  { value: 'align', label: t('tabAlign') },
]
