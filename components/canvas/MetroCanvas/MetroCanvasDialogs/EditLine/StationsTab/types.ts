import type { Line } from '@/types/metro'

export interface StationsTabItem {
  id: string
  name: string
}

export interface StationsTabProps {
  line: Line
  onReorder: (orderedStationIds: Array<string>) => Promise<void>
}
