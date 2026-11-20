'use client'

import { Button } from '@/components/ui/Button'
import { CloseIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'
import type { SidebarPanelProps } from '../../types'
import { useDesktopPanelDrag } from './hooks/useDesktopPanelDrag'
import { useMobilePanelExpand } from './hooks/useMobilePanelExpand'
import { usePanelMode } from './hooks/usePanelMode'
import styles from './SidebarPanel.module.css'

export function SidebarPanel({
  title,
  width,
  position,
  onPositionChange,
  onClose,
  children,
}: SidebarPanelProps) {
  const t = useTranslations('Sidebar')
  const mode = usePanelMode()

  const desktopDrag = useDesktopPanelDrag({
    enabled: mode === 'desktop',
    position,
    width,
    onPositionChange,
  })

  const mobileExpand = useMobilePanelExpand({
    enabled: mode === 'mobile',
  })

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    desktopDrag.handlePointerDown(e)
    mobileExpand.handlePointerDown(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    desktopDrag.handlePointerMove(e)
    mobileExpand.handlePointerMove(e)
  }

  const handlePointerUp = () => {
    desktopDrag.handlePointerUp()
    mobileExpand.handlePointerUp()
  }

  const panelStyle: CSSProperties = {
    '--panel-width': `${width}px`,
    '--panel-left': `${position.left}px`,
    '--panel-top': `${position.top}px`,
    ...mobileExpand.getPanelStyleOverride(),
  } as CSSProperties

  const panelClassName = [
    mobileExpand.getPanelClassName(styles.panel, styles.expanded),
    mobileExpand.isDragging ? styles.dragging : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showDragHandle = mode === 'mobile'

  return (
    <section className={panelClassName} style={panelStyle} data-sidebar-panel>
      <div
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {showDragHandle && <span className={styles.dragHandle} aria-hidden="true" />}

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
