import { type ChangeEvent, useCallback, useState } from 'react'

export const useTimeField = (initialMinutes: number) => {
  const [time, setTime] = useState(String(initialMinutes))

  const handleTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (/^\d*$/.test(value)) {
      setTime(value)
    }
  }, [])

  const reset = useCallback(() => {
    setTime(String(initialMinutes))
  }, [initialMinutes])

  const minutes = Number(time)
  const isValidTime = time.trim() !== '' && minutes > 0

  return { time, minutes, isValidTime, handleTimeChange, reset }
}
