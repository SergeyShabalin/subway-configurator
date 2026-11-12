import { useAsyncAction } from '@/components/canvas/shared/useAsyncAction'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import type { DeleteScope, EditStationData } from '../../types'

interface UseEditStationModalParams {
  station: EditStationData
  onClose: () => void
  onSave: (name: string) => Promise<void>
  onDelete: (scope: DeleteScope) => Promise<void>
  onSaveError: (error: unknown) => void
  onDeleteError: (error: unknown) => void
  confirmDelete: () => boolean
}

export const useEditStationModal = ({
  station,
  onClose,
  onSave,
  onDelete,
  onSaveError,
  onDeleteError,
  confirmDelete,
}: UseEditStationModalParams) => {
  const { stationName: initialName, lineOptions } = station

  const [stationName, setStationName] = useState(initialName)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const saveAction = useAsyncAction({ onError: onSaveError })
  const deleteAction = useAsyncAction({ onError: onDeleteError })

  // Один общий флаг, как раньше: пока идёт сохранение или удаление, всё заблокировано
  const isLoading = saveAction.isLoading || deleteAction.isLoading

  const isSaveDisabled = isLoading || !stationName.trim() || stationName === initialName

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStationName(e.target.value)
  }

  const handleSave = async () => {
    if (!stationName.trim()) return
    if (stationName === initialName) return

    await saveAction.run(async () => {
      await onSave(stationName.trim())
      onClose()
    })
  }

  const runDelete = async (scope: DeleteScope) => {
    await deleteAction.run(async () => {
      await onDelete(scope)
      setIsDeleteModalOpen(false)
      onClose()
    })
  }

  const handleDelete = async () => {
    if (lineOptions.length > 1) {
      setIsDeleteModalOpen(true)
      return
    }

    if (!confirmDelete()) return

    await runDelete({ type: 'all' })
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const openTransferModal = () => {
    setIsTransferModalOpen(true)
  }

  const closeTransferModal = async () => {
    setIsTransferModalOpen(false)
  }

  return {
    state: { stationName, isLoading, isSaveDisabled, isTransferModalOpen, isDeleteModalOpen },
    actions: {
      handleNameChange,
      handleSave,
      handleDelete,
      runDelete,
      closeDeleteModal,
      openTransferModal,
      closeTransferModal,
    },
  }
}
