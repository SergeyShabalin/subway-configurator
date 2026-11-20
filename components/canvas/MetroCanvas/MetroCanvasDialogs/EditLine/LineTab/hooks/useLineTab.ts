import { useAsyncAction } from '@/components/canvas/shared/useAsyncAction'
import { linesService } from '@/src/lib/services'
import type { LineType } from '@/types/metro'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import type { LineTabProps } from '../types'

type UseLineTabParams = LineTabProps & {
  onError: (error: unknown) => void
  onDeleteError: (error: unknown) => void
  confirmDelete: () => boolean
}

export const useLineTab = ({
  line,
  onClose,
  reloadData,
  onError,
  onDeleteError,
  confirmDelete,
}: UseLineTabParams) => {
  const [name, setName] = useState(line.name)
  const [color, setColor] = useState(line.color)
  const [lineBadge, setLineBadge] = useState(line.lineBadge)
  const [isCircular, setIsCircular] = useState(line.is_circular === 1)
  const [lineType, setLineType] = useState<LineType>(line.type ?? 'subway')

  const saveAction = useAsyncAction({ onError })
  const deleteAction = useAsyncAction({ onError: onDeleteError })

  // Общий флаг: пока идёт сохранение или удаление, всё заблокировано
  const isLoading = saveAction.isLoading || deleteAction.isLoading

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

    await saveAction.run(async () => {
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

  const handleDelete = async () => {
    if (!confirmDelete()) return

    await deleteAction.run(async () => {
      await linesService.delete(line.id)
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
      handleDelete,
    },
  }
}
