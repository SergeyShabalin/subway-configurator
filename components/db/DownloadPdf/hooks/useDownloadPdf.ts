import { getStage } from '@/src/lib/stageRegistry/stageRegistry'
import { useCallback, useState } from 'react'
import { PDF_FILE_NAME } from '../constants'
import { ExportError } from '../errors'
import { buildPdf } from '../helpers/buildPdf'
import { getBackgroundColor, waitForPaint } from '../helpers/dom'
import { renderStageToImage } from '../helpers/renderStageToImage'
import type { ExportStatus, ExportStatusType } from '../types'

const LOADING_STATUSES: ReadonlySet<ExportStatusType> = new Set(['rendering', 'creatingFile'])

export const useDownloadPdf = () => {
  const [status, setStatus] = useState<ExportStatus>({ type: 'idle' })

  const download = useCallback(async () => {
    try {
      const stage = getStage()
      if (!stage) throw new ExportError('noStage')

      setStatus({ type: 'rendering' })
      await waitForPaint()

      const image = renderStageToImage(stage)
      const background = getBackgroundColor(stage.container())

      setStatus({ type: 'creatingFile' })
      await waitForPaint()

      const pdf = await buildPdf({ ...image, background })
      pdf.save(PDF_FILE_NAME)

      setStatus({ type: 'success' })
    } catch (error) {
      console.error('PDF export failed:', error)
      setStatus({ type: 'error', error })
    }
  }, [])

  return { status, isLoading: LOADING_STATUSES.has(status.type), download }
}
