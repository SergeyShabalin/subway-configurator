import { useCallback, useState } from 'react'

interface UseMetroModalReturn {
  isModalOpen: boolean
  clickPosition: { x: number; y: number }
  openModal: (x: number, y: number) => void
  closeModal: () => void
  resetPosition: () => void
}

export const useMetroModal = (): UseMetroModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })

  const openModal = useCallback((x: number, y: number) => {
    setClickPosition({ x, y })
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const resetPosition = useCallback(() => {
    setClickPosition({ x: 0, y: 0 })
  }, [])

  return {
    isModalOpen,
    clickPosition,
    openModal,
    closeModal,
    resetPosition,
  }
}
