'use client'

import styles from './SubwayLoader.module.css'

const stations = [
  { left: '8%', top: '58%' },
  { left: '28%', top: '30%' },
  { left: '50%', top: '55%' },
  { left: '72%', top: '25%' },
  { left: '92%', top: '48%' },
]

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

          {stations.map((station, index) => (
            <div
              key={index}
              className={styles.station}
              style={{
                left: station.left,
                top: station.top,
                animationDelay: `${index * 0.3}s`,
              }}
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
