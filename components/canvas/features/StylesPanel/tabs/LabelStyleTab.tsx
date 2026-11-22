'use client'

import { CANVAS_LABEL_FILL, CANVAS_LABEL_FONT_STYLE } from '@/components/canvas/shared/themeColors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input/Input'
import { THEME_VALUE } from '@/components/ui/ThemeToggle/const'
import { useTheme } from '@/context/theme-context'
import { LABEL_FONT_SIZE_MAX, LABEL_FONT_SIZE_MIN } from '@/src/lib/styles/sanitizeStyles'
import { useMetroStore } from '@/store'
import { useTranslations } from 'next-intl'
import styles from '../StylesPanel.module.css'

const DEFAULT_FONT_SIZE = 14

export const LabelStyleTab = () => {
  const t = useTranslations('StylesPanel')
  const { theme } = useTheme()
  const labels = useMetroStore((state) => state.styles.labels)
  const update = useMetroStore((state) => state.updateLabelStyle)
  const reset = useMetroStore((state) => state.resetLabelStyle)

  const fontSize = labels?.fontSize ?? DEFAULT_FONT_SIZE
  const isBold = labels?.bold ?? CANVAS_LABEL_FONT_STYLE[theme] === 'bold'
  const isItalic = labels?.italic ?? false
  const colorLight = labels?.colorLight ?? CANVAS_LABEL_FILL[THEME_VALUE.LIGHT]
  const colorDark = labels?.colorDark ?? CANVAS_LABEL_FILL[THEME_VALUE.DARK]

  return (
    <>
      <p className={styles.hint}>{t('labelsDescription')}</p>

      <div className={styles.field}>
        <span className={styles.label}>{t('fontSizeLabel', { value: fontSize })}</span>
        <input
          type="range"
          className={styles.range}
          min={LABEL_FONT_SIZE_MIN}
          max={LABEL_FONT_SIZE_MAX}
          step={1}
          value={fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t('fontStyleLabel')}</span>
        <div className={styles.row}>
          <Button
            variant="soft"
            iconOnly
            active={isBold}
            aria-pressed={isBold}
            aria-label={t('bold')}
            onClick={() => update({ bold: !isBold })}
          >
            <b>B</b>
          </Button>
          <Button
            variant="soft"
            iconOnly
            active={isItalic}
            aria-pressed={isItalic}
            aria-label={t('italic')}
            onClick={() => update({ italic: !isItalic })}
          >
            <i>I</i>
          </Button>
        </div>
      </div>

      <div className={styles.field}>
        <Input
          type="color"
          label={t('colorLightLabel')}
          value={colorLight}
          onChange={(e) => update({ colorLight: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <Input
          type="color"
          label={t('colorDarkLabel')}
          value={colorDark}
          onChange={(e) => update({ colorDark: e.target.value })}
        />
      </div>

      <Button variant="soft" onClick={reset} disabled={!labels}>
        {t('reset')}
      </Button>
    </>
  )
}
