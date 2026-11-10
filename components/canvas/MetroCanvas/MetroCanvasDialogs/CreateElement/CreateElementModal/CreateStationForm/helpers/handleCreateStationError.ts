export const handleCreateStationError = (error: unknown, t: (key: string) => string) => {
  console.error('Error creating station:', error)

  if (error instanceof Error && error.message.endsWith('ALREADY_ON_LINE')) {
    alert(t('errorAlreadyOnLine'))
  } else {
    alert(t('errorCreate'))
  }
}
