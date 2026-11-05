export const normalize = (value: string): string =>
  value.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()

export const tokenize = (value: string): Array<string> =>
  value.split(/[\s\-_/.,()]+/).filter(Boolean)
