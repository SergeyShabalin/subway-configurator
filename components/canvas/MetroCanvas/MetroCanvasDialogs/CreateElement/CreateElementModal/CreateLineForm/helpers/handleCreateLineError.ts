export const handleCreateLineError = (error: unknown, t: (key: string) => string) => {
  console.error('Error creating line:', error)
  alert(t('errorCreate'))
}
