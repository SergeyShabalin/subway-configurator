'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input/Input'
import { useTranslations } from 'next-intl'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import type { CreateLinePayload } from "../../types"
import styles from './CreateLineForm.module.css'

const DEFAULT_COLOR = '#3b82f6'

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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!lineName.trim()) return

    setIsLoading(true)

    try {
      await onSubmit({ name: lineName.trim(), color: lineColor })

      setLineName('')
      setLineColor(DEFAULT_COLOR)
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
        <Input
          type="color"
          label={t('colorLabel')}
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button title={t('cancel')} variant="outline" onClick={onCancel} disabled={isLoading} />
        <Button title={t('submit')} type="submit" loading={isLoading} disabled={!lineName.trim()} />
      </div>
    </form>
  )
}
