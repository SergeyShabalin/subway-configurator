// components/ui/ContextMenu/ContextMenu.tsx
'use client'

import { useEffect, useRef } from 'react'
import styles from './ContextMenu.module.css'

interface ContextMenuProps {
  x: number
  y: number
  onDelete: () => void
  onClose: () => void
}

export const ContextMenu = ({ x, y, onDelete, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={menuRef} className={styles.menu} style={{ left: x, top: y }}>
      <button className={styles.item} onClick={onDelete}>
        <span className={styles.icon}>🗑️</span>
        Удалить станцию
      </button>
    </div>
  )
}
