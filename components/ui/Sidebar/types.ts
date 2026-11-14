import type { ReactNode } from 'react'

export interface SidebarItem {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
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
}

export interface SidebarToolbarProps {
  items: Array<SidebarItem>
  activeId: string | null
  onItemClick: (id: string) => void
}
