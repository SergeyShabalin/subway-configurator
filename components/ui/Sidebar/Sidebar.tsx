'use client'

import { useCallback, useState } from 'react'
import { SidebarPanel } from './components/SidebarPanel/SidebarPanel'
import { SidebarToolbar } from './components/SidebarToolbar/SidebarToolbar'
import styles from './Sidebar.module.css'
import type { PanelPosition, SidebarProps } from './types'

const TOOLBAR_LEFT = 10
const TOOLBAR_WIDTH = 76
const TOOLBAR_TOP = 10
const GAP = 10

const INITIAL_POSITION: PanelPosition = {
  left: TOOLBAR_LEFT + TOOLBAR_WIDTH + GAP,
  top: TOOLBAR_TOP,
}

export function Sidebar({ items, defaultActiveId, panelWidth = 380, className }: SidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(() =>
    items.some((item) => item.id === defaultActiveId) ? (defaultActiveId ?? null) : null
  )

  const [position, setPosition] = useState<PanelPosition>(INITIAL_POSITION)

  const activeItem = items.find((item) => item.id === activeId)

  const handleItemClick = (id: string) => {
    setActiveId((currentId) => {
      const nextId = currentId === id ? null : id
      if (nextId !== null && nextId !== currentId) {
        setPosition(INITIAL_POSITION)
      }
      return nextId
    })
  }

  const handleClose = useCallback(() => {
    setActiveId(null)
  }, [])

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <SidebarToolbar items={items} activeId={activeId} onItemClick={handleItemClick} />

      {activeItem && (
        <SidebarPanel
          title={activeItem.label}
          width={panelWidth}
          position={position}
          onPositionChange={setPosition}
          onClose={handleClose}
        >
          {activeItem.content}
        </SidebarPanel>
      )}
    </div>
  )
}
