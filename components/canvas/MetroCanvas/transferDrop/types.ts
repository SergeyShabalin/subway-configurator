export interface TransferDraft {
  fromVisualId: string
  toVisualId: string
  dropPosition: { x: number; y: number }
}

export interface DropTarget {
  visualId: string
  armed: boolean
}

export interface TransferDropApi {
  target: DropTarget | null
  move: (visualId: string, x: number, y: number) => void
  end: (visualId: string) => boolean
}
