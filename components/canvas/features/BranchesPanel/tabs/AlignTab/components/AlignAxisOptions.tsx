'use client'

import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import type { useAlignStations } from '../hooks/useAlignStations'

interface AlignAxisOptionsProps {
  axis: ReturnType<typeof useAlignStations>['axis']
}

export const AlignAxisOptions = ({ axis }: AlignAxisOptionsProps) => {
  const t = useTranslations('AlignTab')

  return (
    <>
      <Input
        type="checkbox"
        label={t('axisVertical')}
        checked={axis.value === 'vertical'}
        onChange={() => axis.toggle('vertical')}
        disabled={axis.isDisabled}
      />
      <Input
        type="checkbox"
        label={t('axisHorizontal')}
        checked={axis.value === 'horizontal'}
        onChange={() => axis.toggle('horizontal')}
        disabled={axis.isDisabled}
      />
      <Input
        type="checkbox"
        label={t('equalSpacing')}
        checked={axis.equalSpacing}
        onChange={axis.toggleEqualSpacing}
        disabled={axis.isDisabled}
      />
    </>
  )
}
