import { useAsyncAction } from '@/components/canvas/shared/useAsyncAction'
import { linesService } from '@/src/lib/services'
import type { LineType } from '@/types/metro'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import type { LineTabProps } from '../types'

type UseLineTabParams = LineTabProps & { onError: (error: unknown) => void }

export const useLineTab = ({ line, onClose, reloadData, onError }: UseLineTabParams) => {
  const [name, setName] = useState(line.name)
  const [color, setColor] = useState(line.color)
  const [lineBadge, setLineBadge] = useState(line.lineBadge)
  const [isCircular, setIsCircular] = useState(line.is_circular === 1)
  const [lineType, setLineType] = useState<LineType>(line.type ?? 'subway')

  const { isLoading, run } = useAsyncAction({ onError })

  const isDirty =
    name !== line.name ||
    color !== line.color ||
    lineBadge !== line.lineBadge ||
    isCircular !== (line.is_circular === 1) ||
    lineType !== (line.type ?? 'subway')

  const isSaveDisabled = isLoading || !name.trim() || !isDirty

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleLineBadgeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLineBadge(e.target.value)
  }

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleIsCircularChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsCircular(e.target.checked)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (!isDirty) return

    await run(async () => {
      await linesService.update(line.id, {
        name: name.trim(),
        color,
        lineBadge,
        is_circular: isCircular ? 1 : 0,
        type: lineType,
      })
      await reloadData()
      onClose()
    })
  }

  return {
    state: { name, color, lineBadge, isCircular, lineType, isLoading, isSaveDisabled },
    actions: {
      setLineType,
      handleNameChange,
      handleLineBadgeChange,
      handleColorChange,
      handleIsCircularChange,
      handleSave,
    },
  }
}
