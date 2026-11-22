import { RoutePanel, ToolsPanel } from '@/components/canvas/features'
import { BranchesPanel } from '@/components/canvas/features/BranchesPanel/BranchesPanel'
import { StylesPanel } from '@/components/canvas/features/StylesPanel/StylesPanel'
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
      expandable: true,
      mobileHeights: { collapsed: '38dvh', expanded: '90dvh' },
    },
    {
      id: 'layers',
      label: t('branches'),
      icon: <LayersIcon className={styles.icon} />,
      content: <BranchesPanel />,
    },
    {
      id: 'palette',
      label: t('styles'),
      icon: <PaletteIcon className={styles.icon} />,
      content: <StylesPanel />,
    },
    {
      id: 'tools',
      label: t('tools'),
      icon: <UploadIcon className={styles.icon} />,
      content: <ToolsPanel />,
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <SettingsIcon className={styles.icon} />,
      content: <div className={styles.unavailable}>{t('unavailable', { tab: t('settings') })}</div>,
    },
  ]
}
