'use client'

import { Sidebar } from '@/components/ui/Sidebar/Sidebar'
import { useSidebarItems } from './hooks/useSidebarItems'

export function MetroSidebar() {
  const items = useSidebarItems()

  return <Sidebar items={items} panelWidth={380} />
}
