import { useNodeOptions } from '@/components/canvas/shared/options/useNodeOptions'
import { filterTransferTargets } from '@/components/canvas/shared/transfers/filterTransferTargets'
import { useAsyncAction } from '@/components/canvas/shared/useAsyncAction'
import { transfersService } from '@/src/lib/services'
import type { TransferStyle } from '@/src/lib/services/transfers.service'
import { useMetroStore } from '@/store'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { CreateTransferModalProps } from '../types'

const DEFAULT_STYLE: TransferStyle = 'dashed'
const DEFAULT_TIME_MINUTES = 3

type UseCreateTransferFormProps = Pick<
  CreateTransferModalProps,
  'fromVisualId' | 'initialToVisualId' | 'existingTransferIds' | 'onSuccess'
> & {
  onError: (error: unknown) => void
}

export const useCreateTransferForm = ({
  fromVisualId,
  initialToVisualId,
  existingTransferIds,
  onSuccess,
  onError,
}: UseCreateTransferFormProps) => {
  const loadData = useMetroStore((state) => state.loadData)
  const nodeOptions = useNodeOptions()

  const [selectedVisualId, setSelectedVisualId] = useState(initialToVisualId ?? '')
  const [timeMinutes, setTimeMinutes] = useState(DEFAULT_TIME_MINUTES)
  const [transferStyle, setTransferStyle] = useState<TransferStyle>(DEFAULT_STYLE)

  const { isLoading, run } = useAsyncAction({ onError })

  const options = useMemo(
    () => filterTransferTargets(nodeOptions, fromVisualId, existingTransferIds),
    [nodeOptions, fromVisualId, existingTransferIds]
  )

  const isSubmitDisabled = !selectedVisualId

  const resetForm = () => {
    setSelectedVisualId('')
    setTimeMinutes(DEFAULT_TIME_MINUTES)
    setTransferStyle(DEFAULT_STYLE)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedVisualId) return

    await run(async () => {
      await transfersService.create({
        fromVisualId,
        toVisualId: selectedVisualId,
        timeMinutes,
        style: transferStyle,
      })

      await loadData()
      resetForm()
      await onSuccess?.()
    })
  }

  return {
    state: { selectedVisualId, timeMinutes, transferStyle, options, isLoading, isSubmitDisabled },
    actions: { setSelectedVisualId, setTimeMinutes, setTransferStyle, handleSubmit },
  }
}
