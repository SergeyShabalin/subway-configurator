'use client'

import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { useTranslations } from 'next-intl'

interface RoutePointFieldProps {
  label: string
  value: string
  options: Array<DropdownOption<string>>
  onChange: (value: string) => void
}

export const RoutePointField = ({ label, value, options, onChange }: RoutePointFieldProps) => {
  const t = useTranslations('RoutePanel')

  return (
    <Dropdown
      label={label}
      value={value}
      options={options}
      placeholder={t('placeholder')}
      emptyMessage={t('placeholder')}
      onChange={onChange}
      largeList
    />
  )
}
