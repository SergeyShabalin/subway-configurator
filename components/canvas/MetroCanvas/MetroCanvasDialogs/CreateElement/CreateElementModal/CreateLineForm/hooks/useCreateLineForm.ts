import { useAsyncAction } from '@/components/canvas/shared/useAsyncAction'
import type { LineType } from '@/types/metro'
import type { FormEvent } from 'react'
import { useState } from 'react'
import type { CreateLineFormProps } from '../types'

const DEFAULT_COLOR = '#3b82f6'
const DEFAULT_TYPE: LineType = 'subway'
const DEFAULT_LINE_BADGE: string = ''

type UseCreateLineFormProps = Pick<
  CreateLineFormProps,
  'onSubmit' | 'onSuccess' | 'onLoadingChange'
> & {
  onError: (error: unknown) => void
}

export const useCreateLineForm = ({
  onSubmit,
  onSuccess,
  onLoadingChange,
  onError,
}: UseCreateLineFormProps) => {
  const [lineName, setLineName] = useState('')
  const [lineColor, setLineColor] = useState(DEFAULT_COLOR)
  const [lineBadge, setLineBadge] = useState(DEFAULT_LINE_BADGE)
  const [lineType, setLineType] = useState<LineType>(DEFAULT_TYPE)

  const { isLoading, run } = useAsyncAction({ onError, onLoadingChange })

  const isSubmitDisabled = !lineName.trim()

  const resetForm = () => {
    setLineName('')
    setLineColor(DEFAULT_COLOR)
    setLineBadge(DEFAULT_LINE_BADGE)
    setLineType(DEFAULT_TYPE)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitDisabled) return

    await run(async () => {
      await onSubmit({
        name: lineName.trim(),
        color: lineColor,
        lineBadge,
        type: lineType,
      })

      resetForm()
      onSuccess?.()
    })
  }

  return {
    state: { lineName, lineColor, lineBadge, lineType, isLoading, isSubmitDisabled },
    actions: { setLineName, setLineColor, setLineBadge, setLineType, handleSubmit },
  }
}
