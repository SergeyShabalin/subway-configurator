'use client'

import { Button } from '@/components/ui/Button/Button'
import { useTranslations } from 'next-intl'
import styles from '../DownloadJson/DownloadJson.module.css'
import { useDownloadPdf } from './hooks/useDownloadPdf'
import { ExportError, ExportStatusType } from './types'

const STATUS_MESSAGE_KEY = {
  idle: null,
  rendering: 'status.rendering',
  creatingFile: 'status.creatingFile',
  success: 'status.success',
  error: 'status.error',
} as const satisfies Record<ExportStatusType, string | null>

const STATUS_CLASS: Record<ExportStatusType, string | undefined> = {
  idle: undefined,
  rendering: styles.statusInfo,
  creatingFile: styles.statusInfo,
  success: styles.statusSuccess,
  error: styles.statusError,
}

export const DownloadPdf = () => {
  const t = useTranslations('DownloadPdf')
  const { status, isLoading, download } = useDownloadPdf()

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof ExportError) return t(`errors.${error.key}`)
    if (error instanceof Error) return error.message
    return t('errors.unknown')
  }

  const messageKey = STATUS_MESSAGE_KEY[status.type]
  const statusText = messageKey
    ? t(messageKey, { message: status.type === 'error' ? getErrorMessage(status.error) : '' })
    : null

  return (
    <>
      <Button variant="outlineColored" color="warning" onClick={download} loading={isLoading}>
        {isLoading ? t('button.loading') : t('button.idle')}
      </Button>

      {statusText && (
        <div className={`${styles.status} ${STATUS_CLASS[status.type]}`}>{statusText}</div>
      )}
    </>
  )
}
