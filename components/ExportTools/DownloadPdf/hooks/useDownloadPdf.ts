import { lightenStage } from '@/components/ExportTools/DownloadPdf/helpers/lightenStage'
import { LABEL_FONT_FAMILY } from '@/components/canvas/shared/labelFont'
import { getStage } from '@/src/lib/stageRegistry/stageRegistry'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { PDF_FILE_NAME } from '../constants'
import { ExportError } from '../errors'
import { buildPdf } from '../helpers/buildPdf'
import { getBackgroundColor, waitForPaint } from '../helpers/dom'
import { renderStageToImage } from '../helpers/renderStageToImage'
import type { ExportStatus, ExportStatusType } from '../types'

const LOADING_STATUSES: ReadonlySet<ExportStatusType> = new Set(['rendering', 'creatingFile'])

export const useDownloadPdf = () => {
  const t = useTranslations('DownloadPdf')
  const lines = useMetroStore((state) => state.lines)
  const [status, setStatus] = useState<ExportStatus>({ type: 'idle' })

  const legendTitle = t('legendTitle')

  const download = useCallback(async () => {
    try {
      const stage = getStage()
      if (!stage) throw new ExportError('noStage')

      setStatus({ type: 'rendering' })
      await waitForPaint()

      const background = getBackgroundColor(stage.container())

      const restore = lightenStage(stage)
      let image
      try {
        image = await renderStageToImage(stage, background, {
          lines,
          title: legendTitle,
          fontFamily: LABEL_FONT_FAMILY,
        })
      } finally {
        restore()
      }

      setStatus({ type: 'creatingFile' })
      await waitForPaint()

      const pdf = await buildPdf(image)
      pdf.save(PDF_FILE_NAME)

      setStatus({ type: 'success' })
    } catch (error) {
      console.error('PDF ExportTools failed:', error)
      setStatus({ type: 'error', error })
    }
  }, [lines, legendTitle])

  return { status, isLoading: LOADING_STATUSES.has(status.type), download }
}
