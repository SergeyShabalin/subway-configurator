'use client'

import type { CSSProperties } from 'react'
import styles from './SubwayLoader.module.css'

/** Номера станций: позиции лежат в глобальных переменных `--loader-station-N-x/y` */
const STATION_NUMBERS = [1, 2, 3, 4, 5]

interface MetroLoaderProps {
  text?: string
}

function SubwayLoader({ text = 'Building metro' }: MetroLoaderProps) {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.loader}>
        <div className={styles.map}>
          <svg className={styles.route} viewBox="0 0 300 120" preserveAspectRatio="none">
            <path className={styles.routeBackground} d="M24 70 L84 36 L150 66 L216 30 L276 58" />
            <path className={styles.routeProgress} d="M24 70 L84 36 L150 66 L216 30 L276 58" />
          </svg>

          {STATION_NUMBERS.map((n, index) => (
            <div
              key={n}
              className={styles.station}
              style={
                {
                  left: `var(--loader-station-${n}-x)`,
                  top: `var(--loader-station-${n}-y)`,
                  '--station-index': index,
                } as CSSProperties
              }
            >
              <span />
            </div>
          ))}

          <div className={styles.dot} />
        </div>

        <div className={styles.text}>
          <span>{text}</span>
          <span className={styles.dots}>...</span>
        </div>
      </div>
    </div>
  )
}

export { SubwayLoader }
