import { useEffect, useState } from 'react'

const CLOSE_DELAY_MS = 200

export const useDeferredClose = (isBusy: boolean, onClose: () => void) => {
  const [pendingClose, setPendingClose] = useState(false)

  useEffect(() => {
    if (!pendingClose) return
    if (isBusy) return

    const timer = setTimeout(() => {
      setPendingClose(false)
      onClose()
    }, CLOSE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [pendingClose, isBusy, onClose])

  const requestClose = () => {
    setPendingClose(true)
  }

  return { pendingClose, requestClose }
}
