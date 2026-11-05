import { getStage } from '@/src/lib/stageRegistry/stageRegistry'
import { useCallback, useState } from 'react'
import { PDF_FILE_NAME } from '../constants'
import { ExportError } from '../errors'
import { buildPdf } from '../helpers/buildPdf'
import { getBackgroundColor, waitForPaint } from '../helpers/dom'
import { renderStageToImage } from '../helpers/renderStageToImage'
import type { ExportStatus, ExportStatusType } from '../types'
import { lightenStage } from '@/components/db/DownloadPdf/helpers/lightenStage'

const LOADING_STATUSES: ReadonlySet<ExportStatusType> = new Set(['rendering', 'creatingFile'])

export const useDownloadPdf = () => {
  const [status, setStatus] = useState<ExportStatus>({ type: 'idle' })

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
        image = await renderStageToImage(stage, background)
      } finally {
        restore()
      }


      setStatus({ type: 'creatingFile' })
      await waitForPaint()

      const pdf = await buildPdf(image)
      pdf.save(PDF_FILE_NAME)

      setStatus({ type: 'success' })
    } catch (error) {
      console.error('PDF export failed:', error)
      setStatus({ type: 'error', error })
    }
  }, [])

  return { status, isLoading: LOADING_STATUSES.has(status.type), download }
}
