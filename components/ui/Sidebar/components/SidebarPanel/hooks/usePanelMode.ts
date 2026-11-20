import { useMediaQuery } from '@/components/ui/Sidebar/hooks/useMediaQuery'

export type PanelMode = 'docked' | 'mobile' | 'desktop'

const MOBILE_QUERY = '(max-width: 499px)'
const DOCKED_QUERY = '(max-width: 599px)'

/**
 * Режим панели:
 * - 'mobile'  — <= 499px: bottom sheet с drag-to-expand
 * - 'docked'  — 500–599px: панель прижата, drag отключён
 * - 'desktop' — > 599px: свободное перемещение по position
 */
export const usePanelMode = (): PanelMode => {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const isDocked = useMediaQuery(DOCKED_QUERY)

  if (isMobile) return 'mobile'
  if (isDocked) return 'docked'
  return 'desktop'
}
