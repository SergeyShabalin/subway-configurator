import type Konva from 'konva'

export interface MetroLabelsProps {
  stationNames: Record<string, string>
  textRef: React.MutableRefObject<Record<string, Konva.Text>>
  onLabelMove: (visualId: string, x: number, y: number) => void
}
