'use client'

import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input/Input'
import { linesService } from '@/src/lib/services'
import type { Line, LineType } from '@/types/metro'
import { useTranslations } from 'next-intl'
import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
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
  const [lineBadge, setLineBadge] = useState(line.lineBadge)
  const [isCircular, setIsCircular] = useState(line.is_circular === 1)
  const [lineType, setLineType] = useState<LineType>(line.type ?? 'subway')
  const [isLoading, setIsLoading] = useState(false)

  const typeOptions = useMemo<Array<DropdownOption<LineType>>>(
    () => [
      { value: 'subway', label: t('typeSubway') },
      { value: 'commuter_rail', label: t('typeCommuterRail') },
    ],
    [t]
  )

  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  const handleLineBadge = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLineBadge(e.target.value)
  }, [])

  const handleColorChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }, [])

  const handleIsCircularChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsCircular(e.target.checked)
  }, [])

  const isDirty =
    name !== line.name ||
    color !== line.color ||
    lineBadge !== line.lineBadge ||
    isCircular !== (line.is_circular === 1) ||
    lineType !== (line.type ?? 'subway')

  const handleSave = useCallback(async () => {
    if (!name.trim()) return
    if (!isDirty) return

    setIsLoading(true)

    try {
      await linesService.update(line.id, {
        name: name.trim(),
        color,
        lineBadge,
        is_circular: isCircular ? 1 : 0,
        type: lineType,
      })
      await reloadData()
      onClose()
    } catch (error) {
      console.error('Error updating line:', error)
      alert(t('errorSave'))
    } finally {
      setIsLoading(false)
    }
  }, [name, color, isCircular, lineType, line, isDirty, lineBadge, reloadData, onClose, t])

  const isDisabled = isLoading || !name.trim() || !isDirty

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
        <Dropdown
          value={lineType}
          options={typeOptions}
          onChange={setLineType}
          label={t('typeLabel')}
          placeholder={t('typePlaceholder')}
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
      <div className={styles.field}>
        <Input
          label={t('lineBadge')}
          type="text"
          value={lineBadge}
          onChange={handleLineBadge}
          disabled={isLoading}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="checkbox"
          label={t('circularLabel')}
          checked={isCircular}
          onChange={handleIsCircularChange}
          disabled={isLoading}
        />
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
