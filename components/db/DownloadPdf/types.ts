export type Rgb = [number, number, number]

export type ExportStatus =
  | { type: 'idle' }
  | { type: 'rendering' }
  | { type: 'creatingFile' }
  | { type: 'success' }
  | { type: 'error'; error: unknown }

export type ExportStatusType = ExportStatus['type']

export interface RenderedImage {
  dataUrl: string
  width: number
  height: number
}

export type ExportErrorKey = 'noStage' | 'emptyMap'

export class ExportError extends Error {
  constructor(public readonly key: ExportErrorKey) {
    super(key)
    this.name = 'ExportError'
  }
}
