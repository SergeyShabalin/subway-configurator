'use client'

import { DownloadJson } from '@/components/db/DownloadJson/DownloadJson'
import { UploadJson } from '@/components/db/UploadJson/UploadJson'
import { CloseIcon, SettingsIcon } from '@/components/ui/Icons'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from './ToolsMenu.module.css'

export const ToolsMenu = () => {
  const t = useTranslations('ToolsMenu')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        aria-label={isOpen ? t('close') : t('open')}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <CloseIcon className={styles.triggerIcon} />
        ) : (
          <SettingsIcon className={styles.triggerIcon} />
        )}
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('uploadSection')}</div>
            <UploadJson />
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('downloadSection')}</div>
            <DownloadJson />
          </div>
        </div>
      )}
    </div>
  )
}
