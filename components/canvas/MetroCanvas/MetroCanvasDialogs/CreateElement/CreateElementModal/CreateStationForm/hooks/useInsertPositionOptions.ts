'use client'

import type { DropdownOption } from '@/components/ui/Dropdown'
import { useMetroStore } from '@/store'
import type { InsertPosition } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

/** Опции «после последней» и «перед первой» станции выбранной линии. Для пустой линии список пуст. */
export const useInsertPositionOptions = (lineId: string): Array<DropdownOption<InsertPosition>> => {
  const t = useTranslations('CreateStationForm')
  const line = useMetroStore((state) => state.lines.find((l) => String(l.id) === lineId))
  const stations = useMetroStore((state) => state.stations)

  return useMemo<Array<DropdownOption<InsertPosition>>>(() => {
    const ids = line?.logicalStationIds ?? []
    if (ids.length === 0) return []

    const nameOf = (id: string) => stations.find((s) => s.id === id)?.name
    const firstName = nameOf(ids[0])
    const lastName = nameOf(ids[ids.length - 1])

    if (!firstName || !lastName) return []

    return [
      { value: 'end', label: t('insertAfter', { name: lastName }) },
      { value: 'start', label: t('insertBefore', { name: firstName }) },
    ]
  }, [line, stations, t])
}
