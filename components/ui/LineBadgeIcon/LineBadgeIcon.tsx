import { contrastText } from '@/src/lib/color/contrastText'

export type LineBadgeShape = 'circle' | 'parallelogram'

interface LineBadgeIconProps {
  text: string
  color: string
  shape?: LineBadgeShape
}

const HEIGHT = 20
const SKEW = 5
const CHAR_WIDTH = 7

/** Значок линии: круг (метро) или параллелограмм (наземные поезда) с номером внутри. */
export const LineBadgeIcon = ({ text, color, shape = 'circle' }: LineBadgeIconProps) => {
  const isCircle = shape === 'circle'
  const width = isCircle ? HEIGHT : Math.max(28, text.length * CHAR_WIDTH + SKEW * 2 + 4)
  const fontSize = isCircle && text.length > 2 ? 9 : 11

  return (
    <svg
      width={width}
      height={HEIGHT}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      {isCircle ? (
        <circle cx={width / 2} cy={HEIGHT / 2} r={HEIGHT / 2} fill={color} />
      ) : (
        <polygon
          points={`${SKEW},0 ${width},0 ${width - SKEW},${HEIGHT} 0,${HEIGHT}`}
          fill={color}
        />
      )}
      <text
        x={width / 2}
        y={HEIGHT / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={700}
        fill={contrastText(color)}
      >
        {text}
      </text>
    </svg>
  )
}
