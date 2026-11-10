import { useAsyncAction, type ActionResult } from '@/components/canvas/shared/useAsyncAction'
import type { InsertPosition } from '@/types/metro'
import type { FormEvent } from 'react'
import { useState } from 'react'
import type { CreateStationFormProps } from '../types'
import { useInsertPositionOptions } from './useInsertPositionOptions'
import { useTimeField } from './useTimeField'
import { useTransferOptions } from './useTransferOptions'

const DEFAULT_TIME_MINUTES = 2
const DEFAULT_INSERT_POSITION: InsertPosition = 'end'

type UseCreateStationFormProps = Omit<CreateStationFormProps, 'lineOptions' | 'onCancel'>

export const useCreateStationForm = ({
  position,
  transferNodes,
  onSubmit,
  onSuccess,
  onLoadingChange,
}: UseCreateStationFormProps) => {
  const [stationName, setStationName] = useState('')
  const [selectedLineId, setSelectedLineId] = useState('')
  const [transferVisualId, setTransferVisualId] = useState('')
  const [insertPosition, setInsertPosition] = useState<InsertPosition>(DEFAULT_INSERT_POSITION)

  const { isLoading, run } = useAsyncAction({ onLoadingChange })

  const {
    time,
    minutes: timeMinutes,
    isValidTime,
    handleTimeChange,
    reset: resetTime,
  } = useTimeField(DEFAULT_TIME_MINUTES)

  const insertPositionOptions = useInsertPositionOptions(selectedLineId)
  const transferOptions = useTransferOptions(transferNodes, selectedLineId)

  const selectedTransfer = transferOptions.find((o) => o.value === transferVisualId)
  const resolvedName = selectedTransfer?.label ?? stationName

  const isSubmitDisabled = isLoading || !resolvedName.trim() || !selectedLineId || !isValidTime

  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId)
    setTransferVisualId('')
    setInsertPosition(DEFAULT_INSERT_POSITION)
  }

  const resetForm = () => {
    setStationName('')
    setSelectedLineId('')
    setTransferVisualId('')
    setInsertPosition(DEFAULT_INSERT_POSITION)
    resetTime()
  }

  const handleSubmit = async (e: FormEvent): Promise<ActionResult> => {
    e.preventDefault()
    if (isSubmitDisabled) return { success: true }

    return run(async () => {
      await onSubmit({
        name: resolvedName.trim(),
        lineId: selectedLineId,
        x: position.x,
        y: position.y,
        transferToVisualId: transferVisualId || undefined,
        timeMinutes,
        insertPosition,
      })

      resetForm()
      onSuccess?.()
    })
  }

  return {
    state: {
      stationName,
      selectedLineId,
      transferVisualId,
      insertPosition,
      isLoading,
      time,
      resolvedName,
      insertPositionOptions,
      transferOptions,
      isSubmitDisabled,
    },
    actions: {
      setStationName,
      setTransferVisualId,
      setInsertPosition,
      handleLineChange,
      handleTimeChange,
      handleSubmit,
    },
  }
}
