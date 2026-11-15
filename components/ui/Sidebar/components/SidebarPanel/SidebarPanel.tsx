'use client'

import { Button } from '@/components/ui/Button'
import { CloseIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'
import type { CSSProperties, PointerEvent } from 'react'
import { useRef } from 'react'
import { DOCKED_MEDIA_QUERY } from '../../constants'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { PanelPosition, SidebarPanelProps } from '../../types'
import styles from './SidebarPanel.module.css'

interface DragOffset {
  x: number
  y: number
}

export function SidebarPanel({
  title,
  width,
  position,
  onPositionChange,
  onClose,
  children,
}: SidebarPanelProps) {
  const t = useTranslations('Sidebar')
  const isDocked = useMediaQuery(DOCKED_MEDIA_QUERY)
  const dragOffset = useRef<DragOffset | null>(null)

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isDocked) return
    if ((event.target as HTMLElement).closest('button')) return

    dragOffset.current = {
      x: event.clientX - position.left,
      y: event.clientY - position.top,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current) return

    const panel = event.currentTarget.closest(`.${styles.panel}`)

    if (!panel) return

    const panelHeight = panel.getBoundingClientRect().height

    const nextPosition: PanelPosition = {
      left: Math.max(
        92,
        Math.min(event.clientX - dragOffset.current.x, window.innerWidth - width - 16)
      ),
      top: Math.max(
        8,
        Math.min(event.clientY - dragOffset.current.y, window.innerHeight - panelHeight - 8)
      ),
    }

    onPositionChange(nextPosition)
  }

  const handlePointerUp = () => {
    dragOffset.current = null
  }

  const panelStyle = {
    '--panel-width': `${width}px`,
    '--panel-left': `${position.left}px`,
    '--panel-top': `${position.top}px`,
  } as CSSProperties

  return (
    <section className={styles.panel} style={panelStyle}>
      <div
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <h2 className={styles.title}>{title}</h2>

        <Button
          variant="soft"
          iconOnly
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t('close')}
        >
          <CloseIcon />
        </Button>
      </div>

      <div className={styles.content}>{children}</div>
    </section>
  )
}
