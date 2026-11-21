'use client'

import { Sidebar } from '@/components/ui/Sidebar/Sidebar'
import { useSidebarItems } from './hooks/useSidebarItems'
import { useStandaloneBottomFix } from './hooks/useStandaloneBottomFix'

export function MetroSidebar() {
  useStandaloneBottomFix()
  const items = useSidebarItems()

  return <Sidebar items={items} panelWidth={380} />
}
