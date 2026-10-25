import styles from './OptionColors.module.css'

interface OptionColorsProps {
  colors?: Array<string>
  color?: string
}

export const OptionColors = ({ colors, color }: OptionColorsProps) => {
  const list = colors && colors.length > 0 ? colors : color ? [color] : []

  if (list.length === 0) return null

  return (
    <span className={styles.colors}>
      {list.map((c) => (
        <span key={c} className={styles.dot} style={{ backgroundColor: c }} />
      ))}
    </span>
  )
}
