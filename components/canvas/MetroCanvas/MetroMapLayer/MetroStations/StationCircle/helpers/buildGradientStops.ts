/** Плавный переход через все цвета: [0, c1, 0.5, c2, 1, c3] */
export const buildGradientStops = (colors: ReadonlyArray<string>): Array<number | string> =>
  colors.flatMap((c, i) => [i / (colors.length - 1), c])
