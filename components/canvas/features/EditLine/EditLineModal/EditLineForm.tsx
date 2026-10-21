'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input/Input'
import { linesService } from '@/src/lib/services'
import type { Line } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { type ChangeEvent, useCallback, useState } from 'react'
import styles from './EditLineForm.module.css'

interface EditLineFormProps {
  line: Line
  onClose: () => void
  reloadData: () => Promise<void>
}

export const EditLineForm = ({ line, onClose, reloadData }: EditLineFormProps) => {
  const t = useTranslations('EditLineForm')

  const [name, setName] = useState(line.name)
  const [color, setColor] = useState(line.color)
  const [isLoading, setIsLoading] = useState(false)

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  const handleColorChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim()) return
    if (name === line.name && color === line.color) return

    setIsLoading(true)

    try {
      await linesService.update(line.id, {
        name: name.trim(),
        color,
      })
      await reloadData()
      onClose()
    } catch (error) {
      console.error('Error updating line:', error)
      alert(t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }, [name, color, line, reloadData, onClose, t])

  const isDisabled = isLoading || !name.trim() || (name === line.name && color === line.color)

  return (
    <div className={styles.content}>
      <div className={styles.field}>
        <Input
          label={t('nameLabel')}
          type="text"
          value={name}
          onChange={handleNameChange}
          disabled={isLoading}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('colorLabel')}</label>
        <div className={styles.colorPicker}>
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className={styles.colorInput}
            disabled={isLoading}
          />
          <span className={styles.colorValue}>{color}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          title={t('save')}
          variant="outlineColored"
          color="success"
          onClick={handleSave}
          loading={isLoading}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}
