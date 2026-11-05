import type {
  GraphData,
  Line,
  Segment,
  Station,
  VisualStation,
  VisualTransfer,
} from '@/types/metro'
import { mapGraph } from '../mappers/mapGraph'
import type { SliceCreator } from '../types'

/** Источник данных графа. Стор зависит от этого интерфейса, а не от конкретного сервиса. */
export interface GraphSource {
  getGraph: () => Promise<GraphData>
}

export interface DataSlice {
  stations: Array<Station>
  segments: Array<Segment>
  lines: Array<Line>
  visuals: Record<string, VisualStation>
  visualToStations: Record<string, Array<string>>
  visualTransfers: Array<VisualTransfer>
  isLoading: boolean
  error: string | null
  loadData: () => Promise<void>
}

export const createDataSlice =
  (source: GraphSource): SliceCreator<DataSlice> =>
  (set) => ({
    stations: [],
    segments: [],
    lines: [],
    visuals: {},
    visualToStations: {},
    visualTransfers: [],
    isLoading: false,
    error: null,

    loadData: async () => {
      set({ isLoading: true, error: null })

      try {
        const data = await source.getGraph()
        set({ ...mapGraph(data), isLoading: false, error: null })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
        })
      }
    },
  })
