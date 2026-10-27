import type { RenderedImage, Rgb } from '../types'

interface BuildPdfParams extends RenderedImage {
  background: Rgb
}

export const buildPdf = async ({ dataUrl, width, height, background }: BuildPdfParams) => {
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.setFillColor(...background)
  pdf.rect(0, 0, width, height, 'F')
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)

  return pdf
}
