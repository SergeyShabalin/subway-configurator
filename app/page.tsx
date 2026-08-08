import { Field } from '@/components/field'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <p>The subway configurator</p>
      <Field />
    </div>
  )
}
