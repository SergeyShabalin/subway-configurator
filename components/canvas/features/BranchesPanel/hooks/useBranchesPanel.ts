import { useState } from 'react'
import type { BranchesTab } from '../types'
import { useCircleLayout } from './useCircleLayout'
import { useLineMoveMode } from './useLineMoveMode'

export const useBranchesPanel = () => {
  const circle = useCircleLayout()
  const [tab, setTab] = useState<BranchesTab>('move')
  const [isMoveEnabled, setIsMoveEnabled] = useState(false)

  const hasLine = Boolean(circle.picker.lineId)
  const isMoveBlocked = circle.state.isDirty || circle.state.isSaving

  // Режим переноса активен только на своей вкладке и при включённом переключателе
  const isMoveActive = tab === 'move' && isMoveEnabled && hasLine && !isMoveBlocked
  useLineMoveMode(circle.picker.lineId, isMoveActive)

  return {
    tab,
    selectTab: setTab,
    circle,
    move: {
      isEnabled: isMoveEnabled,
      isActive: isMoveActive,
      isBlocked: isMoveBlocked,
      hasLine,
      toggle: () => setIsMoveEnabled((enabled) => !enabled),
    },
  }
}
