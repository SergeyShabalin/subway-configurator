import { RoutePanel, ToolsPanel } from '@/components/canvas/features'
import { BranchesPanel } from '@/components/canvas/features/BranchesPanel/BranchesPanel'
import { LayersIcon, PaletteIcon, RouteIcon, SettingsIcon, UploadIcon } from '@/components/ui/Icons'
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
      mobileHeights: { collapsed: '38dvh', expanded: '90dvh' },
    },
    {
      id: 'layers',
      label: t('branches'),
      icon: <LayersIcon className={styles.icon} />,
      content: <BranchesPanel />,
      mobileHeights: { collapsed: '43dvh', expanded: '90dvh' },
    },
    {
      id: 'palette',
      label: t('styles'),
      icon: <PaletteIcon className={styles.icon} />,
      content: <div className={styles.unavailable}>{t('unavailable', { tab: t('styles') })}</div>,
      mobileHeights: { collapsed: '15dvh', expanded: '50dvh' },
    },
    {
      id: 'tools',
      label: t('tools'),
      icon: <UploadIcon className={styles.icon} />,
      content: <ToolsPanel />,
      mobileHeights: { collapsed: '35dvh', expanded: '35dvh' },
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <SettingsIcon className={styles.icon} />,
      content: <div className={styles.unavailable}>{t('unavailable', { tab: t('settings') })}</div>,
      mobileHeights: { collapsed: '15dvh', expanded: '50dvh' },
    },
  ]
}
