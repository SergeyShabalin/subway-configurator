'use client'

import { MouseRightClickIcon, TouchIcon } from '@/components/ui/Icons'
import { useMediaQuery } from '@/components/ui/Sidebar/hooks/useMediaQuery'
import { useTranslations } from 'next-intl'
import styles from './HintLetsStarted.module.css'

const MOBILE_MEDIA_QUERY = '(max-width: 499px)'
const TOUCH_MEDIA_QUERY = '(pointer: coarse)'

interface HintLetsStartedProps {
  hasLines: boolean
}

const HINT_KEYS = {
  desktop: {
    lines: { title: 'hintNoLinesTitle', text: 'hintNoLinesText' },
    stations: { title: 'hintNoStationsTitle', text: 'hintNoStationsText' },
  },
  mobile: {
    lines: { title: 'hintNoLinesTitleTouch', text: 'hintNoLinesTextTouch' },
    stations: { title: 'hintNoStationsTitleTouch', text: 'hintNoStationsTextTouch' },
  },
} as const

export const HintLetsStarted = ({ hasLines }: HintLetsStartedProps) => {
  const t = useTranslations('MetroCanvas')
  const isNarrow = useMediaQuery(MOBILE_MEDIA_QUERY)
  const isTouch = useMediaQuery(TOUCH_MEDIA_QUERY)

  const isMobile = isNarrow || isTouch
  const mode = isMobile ? HINT_KEYS.mobile : HINT_KEYS.desktop
  const keys = hasLines ? mode.stations : mode.lines

  return (
    <div className={styles.hint}>
      {isMobile ? (
        <TouchIcon className={styles.icon} />
      ) : (
        <MouseRightClickIcon className={styles.icon} />
      )}

      <div className={styles.title}>{t(keys.title)}</div>
      <div className={styles.text}>{t(keys.text)}</div>
    </div>
  )
}
