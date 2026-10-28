'use client'

import { useTheme } from '@/context/theme-context'
import { THEME_VALUE } from './const'
import { MoonIcon, SunIcon } from './icons'
import styles from './ThemeToggle.module.css'

export const ThemeToggle = () => {
  const { theme, setTheme, isMounted } = useTheme()

  const changeTheme = () => {
    setTheme(theme === THEME_VALUE.LIGHT ? THEME_VALUE.DARK : THEME_VALUE.LIGHT)
  }

  return (
    <div className={styles.container}>
      <label
        htmlFor="themeSwitch"
        className={`${styles.toggle} ${isMounted ? styles.ready : ''}`}
        aria-label="Toggle theme"
      >
        <input
          type="checkbox"
          className={styles.input}
          id="themeSwitch"
          checked={theme === THEME_VALUE.LIGHT}
          onChange={changeTheme}
        />

        {/* Обе иконки всегда в DOM для CSS-анимаций */}
        <div className={`${styles.icon} ${styles.iconMoon}`}>
          <MoonIcon />
        </div>
        <div className={`${styles.icon} ${styles.iconSun}`}>
          <SunIcon />
        </div>
      </label>
    </div>
  )
}
