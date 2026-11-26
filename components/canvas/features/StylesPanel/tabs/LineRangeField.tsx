import type { LineValueSpec } from '@/src/lib/styles/lineValue'
import styles from './LabelStyleTab.module.css'

interface LineRangeFieldProps {
  label: string
  spec: LineValueSpec
  value: number
  onChange: (value: number) => void
}

export const LineRangeField = ({ label, spec, value, onChange }: LineRangeFieldProps) => (
  <div className={styles.field}>
    <span className={styles.label}>{label}</span>
    <input
      type="range"
      className={styles.range}
      min={spec.min}
      max={spec.max}
      step={spec.step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
)
