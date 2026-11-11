import { useAsyncAction, type ActionResult } from '@/components/canvas/shared/useAsyncAction'
import type { InsertPosition } from '@/types/metro'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { CreateStationFormProps } from '../types'
import { useInsertPositionOptions } from './useInsertPositionOptions'
import { useTimeField } from './useTimeField'
import { useTransferOptions } from './useTransferOptions'

const DEFAULT_TIME_MINUTES = 2
const DEFAULT_INSERT_POSITION: InsertPosition = 'end'

type UseCreateStationFormProps = Omit<CreateStationFormProps, 'onCancel'>

export const useCreateStationForm = ({
  position,
  lineOptions: allLineOptions,
  transferNodes,
  initialLineId,
  initialInsertPosition,
  initialTransferVisualId,
  onSubmit,
  onSuccess,
  onLoadingChange,
}: UseCreateStationFormProps) => {
  const [stationName, setStationName] = useState('')
  const [selectedLineId, setSelectedLineId] = useState(initialLineId ?? '')
  const [transferVisualId, setTransferVisualId] = useState(initialTransferVisualId ?? '')
  const [insertPosition, setInsertPosition] = useState<InsertPosition>(
    initialInsertPosition ?? DEFAULT_INSERT_POSITION
  )

  const { isLoading, run } = useAsyncAction({ onLoadingChange })

  const {
    time,
    minutes: timeMinutes,
    isValidTime,
    handleTimeChange,
    reset: resetTime,
  } = useTimeField(DEFAULT_TIME_MINUTES)

  const initialNode = useMemo(
    () =>
      initialTransferVisualId
        ? (transferNodes ?? []).find((n) => n.visualId === initialTransferVisualId)
        : undefined,
    [transferNodes, initialTransferVisualId]
  )

  // Для предвыбранного узла нельзя выбрать линию, которая в нём уже есть
  const lineOptions = useMemo(
    () =>
      initialNode
        ? allLineOptions.filter((o) => !initialNode.lineIds.includes(String(o.value)))
        : allLineOptions,
    [allLineOptions, initialNode]
  )

  const insertPositionOptions = useInsertPositionOptions(selectedLineId)
  const transferOptions = useTransferOptions(transferNodes, selectedLineId, initialTransferVisualId)

  const selectedTransfer = transferOptions.find((o) => o.value === transferVisualId)
  const resolvedName = selectedTransfer?.label ?? stationName

  const isSubmitDisabled = isLoading || !resolvedName.trim() || !selectedLineId || !isValidTime

  const shouldKeepInitialTransfer = (lineId: string) =>
    initialNode !== undefined &&
    transferVisualId === initialNode.visualId &&
    !initialNode.lineIds.includes(String(lineId))

  const handleLineChange = (lineId: string) => {
    setSelectedLineId(lineId)
    if (!shouldKeepInitialTransfer(lineId)) setTransferVisualId('')
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
      lineOptions,
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
