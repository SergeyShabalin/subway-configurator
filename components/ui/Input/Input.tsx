import type { InputHTMLAttributes, RefObject } from 'react'
import { useId } from 'react'
import styles from './Input.module.css'

type InputType = 'text' | 'color' | 'file'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType
  label?: string
  ref?: RefObject<HTMLInputElement | null>
}

const INPUT_CLASSES: Record<InputType, string> = {
  text: styles.input,
  color: styles.colorInput,
  file: styles.fileInput,
}

const Input = ({ type = 'text', label, ref, ...props }: InputProps) => {
  const inputId = useId()
  const isFile = type === 'file'

  const input = (
    <input id={inputId} type={type} className={INPUT_CLASSES[type]} ref={ref} {...props} />
  )

  return (
    <>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      {isFile ? <div className={styles.fileWrapper}>{input}</div> : input}
    </>
  )
}

export { Input }
