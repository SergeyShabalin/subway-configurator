'use client'

import { DownloadJson } from '@/components/ExportTools/DownloadJson/DownloadJson'
import { DownloadPdf } from '@/components/ExportTools/DownloadPdf/DownloadPdf'
import { UploadJson } from '@/components/ExportTools/UploadJson/UploadJson'
import { useTranslations } from 'next-intl'
import styles from './ToolsPanel.module.css'

export const ToolsPanel = () => {
  const t = useTranslations('ToolsPanel')

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('uploadSection')}</div>
        <UploadJson />
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('downloadSection')}</div>
        <DownloadJson />
        <DownloadPdf />
      </div>
    </div>
  )
}
