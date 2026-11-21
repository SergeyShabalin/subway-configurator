import { useEffect } from 'react'

/**
 * iOS standalone: innerHeight короче экрана, поэтому position: fixed; bottom: 0
 * не доходит до низа дисплея. Недостающая разница уходит в CSS-переменную.
 */
export const useStandaloneBottomFix = () => {
  useEffect(() => {
    const isStandalone =
      (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches
    if (!isStandalone) return

    const apply = () => {
      const gap = Math.max(0, Math.round(window.screen.height - window.innerHeight))
      document.documentElement.style.setProperty('--standalone-bottom-gap', `${gap}px`)
    }

    apply()
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])
}
