import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { buildEditLineTabs } from '../helpers/buildEditLineTabs'
import { resolveCurrentTab } from '../helpers/resolveCurrentTab'
import type { EditLineTab } from '../types'

const DEFAULT_TAB: EditLineTab = 'segment'

interface UseEditLineTabsParams {
  hasSegment: boolean
}

export const useEditLineTabs = ({ hasSegment }: UseEditLineTabsParams) => {
  const t = useTranslations('EditLine')
  const [activeTab, setActiveTab] = useState<EditLineTab>(DEFAULT_TAB)

  return {
    tabs: buildEditLineTabs(hasSegment, t),
    currentTab: resolveCurrentTab(activeTab, hasSegment),
    selectTab: setActiveTab,
  }
}
