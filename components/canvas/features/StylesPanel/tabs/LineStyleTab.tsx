'use client'

import { useLineOptions } from '@/components/canvas/shared/options/useLineOptions'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { LINE_CURVATURE_SPEC, resolveLineCurvature } from '@/src/lib/styles/lineCurvature'
import { LINE_WIDTH_SPEC, resolveLineWidthScale } from '@/src/lib/styles/lineWidth'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './LabelStyleTab.module.css'
import { LineRangeField } from './LineRangeField'

export const LineStyleTab = () => {
  const t = useTranslations('StylesPanel')
  const lineOptions = useLineOptions()
  const lineWidths = useMetroStore((state) => state.styles.lineWidths)
  const lineCurvature = useMetroStore((state) => state.styles.lineCurvature)
  const updateLineWidth = useMetroStore((state) => state.updateLineWidth)
  const updateLineCurvature = useMetroStore((state) => state.updateLineCurvature)
  const resetLineStyle = useMetroStore((state) => state.resetLineStyle)
  const resetLineStyles = useMetroStore((state) => state.resetLineStyles)

  const [lineId, setLineId] = useState('')

  const widthScale = resolveLineWidthScale(lineWidths, lineId)
  const curvatureScale = resolveLineCurvature(lineCurvature, lineId)
  const isCustom = lineWidths?.[lineId] !== undefined || lineCurvature?.[lineId] !== undefined
  const hasCustomLines = Boolean(lineWidths || lineCurvature)

  return (
    <>
      <p className={styles.hint}>{t('linesDescription')}</p>

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
          <LineRangeField
            label={t('lineWidthLabel', { value: widthScale.toFixed(1) })}
            spec={LINE_WIDTH_SPEC}
            value={widthScale}
            onChange={(value) => updateLineWidth(lineId, value)}
          />
          <LineRangeField
            label={t('lineCurvatureLabel', { value: curvatureScale.toFixed(1) })}
            spec={LINE_CURVATURE_SPEC}
            value={curvatureScale}
            onChange={(value) => updateLineCurvature(lineId, value)}
          />
          <Button variant="soft" onClick={() => resetLineStyle(lineId)} disabled={!isCustom}>
            {t('resetLine')}
          </Button>
        </>
      )}

      <Button variant="soft" onClick={resetLineStyles} disabled={!hasCustomLines}>
        {t('resetAllLines')}
      </Button>
    </>
  )
}
