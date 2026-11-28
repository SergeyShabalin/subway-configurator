'use client'

import { useLineOptions } from '@/components/canvas/shared/options/useLineOptions'
import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { Switch } from '@/components/ui/Switch/Switch'
import {
  getLineStationStyle,
  resolveStationStyle,
  STATION_KINDS,
  STATION_SIZE_SPEC,
  STATION_STROKE_SPEC,
} from '@/src/lib/styles/stationStyle'
import { useMetroStore } from '@/store'
import type { StationKind } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './LabelStyleTab.module.css'
import { LineRangeField } from './LineRangeField'

const KIND_LABEL_KEY: Record<StationKind, string> = {
  regular: 'stationKindRegular',
  transfer: 'stationKindTransfer',
  multiLine: 'stationKindMultiLine',
}

export const StationStyleTab = () => {
  const t = useTranslations('StylesPanel')
  const lineOptions = useLineOptions()
  const stations = useMetroStore((state) => state.styles.stations)
  const update = useMetroStore((state) => state.updateStationStyle)
  const resetLine = useMetroStore((state) => state.resetStationLine)
  const resetAll = useMetroStore((state) => state.resetStations)

  const [lineId, setLineId] = useState('')
  const [kind, setKind] = useState<StationKind>('regular')

  const kindOptions: Array<DropdownOption<StationKind>> = STATION_KINDS.map((value) => ({
    value,
    label: t(KIND_LABEL_KEY[value]),
  }))

  const { sizeScale, strokeScale, isSquare } = resolveStationStyle(
    getLineStationStyle(stations, lineId, kind)
  )
  const isCustom = stations?.[lineId] !== undefined

  return (
    <>
      <p className={styles.hint}>{t('stationsDescription')}</p>

      <Dropdown
        label={t('lineLabel')}
        value={lineId}
        options={lineOptions}
        placeholder={t('linePlaceholder')}
        emptyMessage={t('linePlaceholder')}
        onChange={setLineId}
        largeList
      />

      {lineId && (
        <>
          <Dropdown
            label={t('stationKindLabel')}
            value={kind}
            options={kindOptions}
            onChange={setKind}
            searchable={false}
          />

          <LineRangeField
            label={t('stationSizeLabel', { value: sizeScale.toFixed(1) })}
            spec={STATION_SIZE_SPEC}
            value={sizeScale}
            onChange={(value) => update(lineId, kind, { sizeScale: value })}
          />

          <LineRangeField
            label={t('stationStrokeLabel', { value: strokeScale.toFixed(1) })}
            spec={STATION_STROKE_SPEC}
            value={strokeScale}
            onChange={(value) => update(lineId, kind, { strokeScale: value })}
          />

          <div className={styles.field}>
            <Switch
              label={t('stationSquareLabel')}
              checked={isSquare}
              onCheckedChange={(checked) => update(lineId, kind, { isSquare: checked })}
            />
          </div>

          <Button variant="soft" onClick={() => resetLine(lineId)} disabled={!isCustom}>
            {t('resetStationLine')}
          </Button>
        </>
      )}

      <Button variant="soft" onClick={resetAll} disabled={!stations}>
        {t('resetStations')}
      </Button>
    </>
  )
}
