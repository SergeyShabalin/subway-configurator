import { RoutePanel, ToolsPanel } from '@/components/canvas/features'
import { LayersIcon, PaletteIcon, RouteIcon, UploadIcon } from '@/components/ui/Icons'
import type { SidebarItem } from '@/components/ui/Sidebar/types'
import { useTranslations } from 'next-intl'
import styles from '../MetroSidebar.module.css'

export const useSidebarItems = (): Array<SidebarItem> => {
  const t = useTranslations('MetroSidebar')

  return [
    {
      id: 'route',
      label: t('route'),
      icon: <RouteIcon className={styles.icon} />,
      content: <RoutePanel />,
    },
    {
      id: 'layers',
      label: t('branches'),
      icon: <LayersIcon className={styles.icon} />,
      content: <div className={styles.unavailable}>{t('unavailable', { tab: t('branches') })}</div>,
    },
    {
      id: 'palette',
      label: t('styles'),
      icon: <PaletteIcon className={styles.icon} />,
      content: <div className={styles.unavailable}>{t('unavailable', { tab: t('styles') })}</div>,
    },
    {
      id: 'tools',
      label: t('tools'),
      icon: <UploadIcon className={styles.icon} />,
      content: <ToolsPanel />,
    },
  ]
}
