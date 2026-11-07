'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import type { LineType } from '@/types/metro'
import { useTranslations } from 'next-intl'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { CreateLinePayload } from '../../types'
import styles from './CreateLineForm.module.css'

const DEFAULT_COLOR = '#3b82f6'
const DEFAULT_TYPE: LineType = 'subway'
const DEFAULT_LINE_BADGE: string = ''

interface AddLineFormProps {
  onSubmit: (data: CreateLinePayload) => Promise<void>
  onSuccess?: () => void
  onCancel?: () => void
  onLoadingChange?: (isLoading: boolean) => void
}

export const CreateLineForm = ({
  onSubmit,
  onSuccess,
  onCancel,
  onLoadingChange,
}: AddLineFormProps) => {
  const t = useTranslations('CreateLineForm')
  const [lineName, setLineName] = useState('')
  const [lineColor, setLineColor] = useState(DEFAULT_COLOR)
  const [lineBadge, setLineBadge] = useState(DEFAULT_LINE_BADGE)
  const [lineType, setLineType] = useState<LineType>(DEFAULT_TYPE)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const typeOptions = useMemo<Array<DropdownOption<LineType>>>(
    () => [
      { value: 'subway', label: t('typeSubway') },
      { value: 'commuter_rail', label: t('typeCommuterRail') },
    ],
    [t]
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!lineName.trim()) return

    setIsLoading(true)

    try {
      await onSubmit({
        name: lineName.trim(),
        color: lineColor,
        lineBadge: lineBadge,
        type: lineType,
      })

      setLineName('')
      setLineColor(DEFAULT_COLOR)
      setLineBadge(DEFAULT_LINE_BADGE)
      setLineType(DEFAULT_TYPE)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating line:', error)
      alert(t('errorCreate'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Input
          value={lineName}
          label={t('nameLabel')}
          onChange={(e) => setLineName(e.target.value)}
          placeholder={t('namePlaceholder')}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <Dropdown<LineType>
          value={lineType}
          options={typeOptions}
          onChange={setLineType}
          label={t('typeLabel')}
          placeholder={t('typePlaceholder')}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="color"
          label={t('colorLabel')}
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          label={t('lineBadge')}
          type="text"
          value={lineBadge}
          onChange={(e) => setLineBadge(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className={styles.actions}>
        <Button title={t('cancel')} variant="outline" onClick={onCancel} disabled={isLoading} />
        <Button title={t('submit')} type="submit" loading={isLoading} disabled={!lineName.trim()} />
      </div>
    </form>
  )
}
