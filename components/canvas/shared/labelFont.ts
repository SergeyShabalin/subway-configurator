import { Golos_Text } from 'next/font/google'

const labelFont = Golos_Text({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
})

export const LABEL_FONT_FAMILY = labelFont.style.fontFamily
