'use client'

import { linesService } from '@/src/lib/services'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './AddLineForm.module.css'

interface AddLineFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const AddLineForm = ({ onSuccess, onCancel }: AddLineFormProps) => {
  const t = useTranslations('AddLineForm')
  const { loadData } = useMetroStore()
  const [lineName, setLineName] = useState('')
  const [lineColor, setLineColor] = useState('#3b82f6')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineName.trim()) return

    setIsLoading(true)
    try {
      await linesService.create({
        name: lineName,
        color: lineColor,
      })

      await loadData()
      onSuccess?.()
      setLineName('')
      setLineColor('#3b82f6')
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
        <label className={styles.label}>{t('nameLabel')}</label>
        <input
          type="text"
          value={lineName}
          onChange={(e) => setLineName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className={styles.input}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('colorLabel')}</label>
        <div className={styles.colorPicker}>
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
            className={styles.colorInput}
          />
          <span className={styles.colorValue}>{lineColor}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={!lineName.trim() || isLoading}
          className={styles.submitButton}
        >
          {isLoading ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  )
}
