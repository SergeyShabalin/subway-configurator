import { useEffect, useState } from 'react'

const LOADER_DELAY_MS = 700

interface UseMetroLoaderResult {
  showLoader: boolean
}

export const useMetroLoader = (isBusy: boolean): UseMetroLoaderResult => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    if (!isBusy) return

    const timer = setTimeout(() => {
      setShowLoader(true)
    }, LOADER_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isBusy])

  useEffect(() => {
    if (!isBusy && showLoader) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLoader(false)
    }
  }, [isBusy, showLoader])

  return { showLoader }
}
