'use client'

import { Button } from '@/components/ui/Button'
import { ReactNode, useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
  disableClose?: boolean
}

const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  disableClose = false,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const isMounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableClose) onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, disableClose])

  if (!isOpen) return null

  const handleOverlayClick = () => {
    if (disableClose) return
    onClose()
  }

  const handleCloseClick = () => {
    if (disableClose) return
    onClose()
  }

  const content = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Button
            title="✕"
            variant="ghost"
            className={styles.closeButton}
            onClick={handleCloseClick}
            disabled={disableClose}
          />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )

  if (!isMounted) return null

  return createPortal(content, document.body)
}
