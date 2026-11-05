export type ExportErrorKey = 'noStage' | 'emptyMap' | 'encodeFailed'

export class ExportError extends Error {
  constructor(public readonly key: ExportErrorKey) {
    super(key)
    this.name = 'ExportError'
  }
}
