import type { ReactNode } from 'react'

export interface SidebarPanelHeights {
  collapsed: string
  expanded: string
}

export interface SidebarItem {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
  mobileHeights?: SidebarPanelHeights
}

export interface PanelPosition {
  left: number
  top: number
}

export interface SidebarProps {
  items: Array<SidebarItem>
  defaultActiveId?: string
  panelWidth?: number
  className?: string
}

export interface SidebarPanelProps {
  title: string
  width: number
  position: PanelPosition
  onPositionChange: (position: PanelPosition) => void
  onClose: () => void
  children: ReactNode
  mobileHeights?: SidebarPanelHeights
}

export interface SidebarToolbarProps {
  items: Array<SidebarItem>
  activeId: string | null
  onItemClick: (id: string) => void
}
