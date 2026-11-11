interface NodeOptionLike {
  value: string
  lineIds: Array<string>
}

/** Пересадка возможна на узлы без общих линий с исходным и без уже созданной пересадки */
export const filterTransferTargets = <T extends NodeOptionLike>(
  nodeOptions: ReadonlyArray<T>,
  fromVisualId: string,
  existingTransferIds: ReadonlyArray<string>
): Array<T> => {
  const fromLineIds = nodeOptions.find((o) => o.value === fromVisualId)?.lineIds ?? []

  return nodeOptions.filter(
    (o) =>
      o.value !== fromVisualId &&
      !existingTransferIds.includes(o.value) &&
      !o.lineIds.some((id) => fromLineIds.includes(id))
  )
}
