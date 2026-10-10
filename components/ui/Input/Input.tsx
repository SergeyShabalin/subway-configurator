import type { InputHTMLAttributes, ReactNode, RefObject } from 'react'
import { useId } from 'react'
import styles from './Input.module.css'

type InputType = 'text' | 'color' | 'file'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType
  label?: string
  children?: ReactNode
  ref?: RefObject<HTMLInputElement | null>
}

const INPUT_CLASSES: Record<InputType, string> = {
  text: styles.input,
  color: styles.colorInput,
  file: styles.fileInput,
}

const Input = ({ type = 'text', label, children, className, ref, ...props }: InputProps) => {
  const inputId = useId()
  const isFile = type === 'file'

  const inputElement = (
    <input id={inputId} type={type} className={INPUT_CLASSES[type]} ref={ref} {...props} />
  )

  if (isFile) {
    const wrapperClassName = [styles.fileWrapper, className].filter(Boolean).join(' ')
    return (
      <>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}
        <label className={wrapperClassName}>
          {inputElement}
          {children}
        </label>
      </>
    )
  }

  return (
    <>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={[INPUT_CLASSES[type], className].filter(Boolean).join(' ')}
        ref={ref}
        {...props}
      />
    </>
  )
}

export { Input }
