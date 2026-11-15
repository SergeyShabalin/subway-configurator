import type { RenderedImage } from '../types'

export const buildPdf = async ({ bytes, width, height }: RenderedImage) => {
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  // JPEG встраивается как есть, без декодирования и пережатия
  pdf.addImage(bytes, 'JPEG', 0, 0, width, height, undefined, 'NONE')

  return pdf
}
