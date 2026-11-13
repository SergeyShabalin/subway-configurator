/** Пересадочные станции общие с другими линиями: при выравнивании сдвинутся и те линии */
export const countSharedStations = (
  path: ReadonlyArray<string>,
  visualToStations: Readonly<Record<string, ReadonlyArray<string>>>
): number => path.slice(1, -1).filter((id) => (visualToStations[id]?.length ?? 0) > 1).length
