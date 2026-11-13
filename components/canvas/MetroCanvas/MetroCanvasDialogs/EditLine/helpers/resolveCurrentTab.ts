import type { EditLineTab } from '../types'

/** После перестановки выбранного участка может уже не быть: тогда открывается вкладка линии */
export const resolveCurrentTab = (activeTab: EditLineTab, hasSegment: boolean): EditLineTab =>
  activeTab === 'segment' && !hasSegment ? 'line' : activeTab
