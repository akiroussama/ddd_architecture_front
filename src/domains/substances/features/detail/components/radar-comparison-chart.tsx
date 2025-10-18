import * as React from "react"

interface RadarDatum {
  criteria: string
  current: number
  alternative: number
}

type SvgTextAnchor = "start" | "middle" | "end"
type SvgDominantBaseline = "auto" | "middle" | "central" | "hanging" | "alphabetic"

interface RadarComparisonChartProps {
  data: RadarDatum[]
  currentLabel: string
  alternativeLabel: string
}

const CLAMP_MIN = 0
const CLAMP_MAX = 100

function clamp(value: number) {
  if (Number.isNaN(value)) return CLAMP_MIN
  return Math.min(Math.max(value, CLAMP_MIN), CLAMP_MAX)
}

export function RadarComparisonChart({
  data,
  currentLabel,
  alternativeLabel
}: RadarComparisonChartProps) {
  const cleaned = React.useMemo(
    () =>
      data.map((entry) => ({
        criteria: entry.criteria,
        current: clamp(entry.current),
        alternative: clamp(entry.alternative)
      })),
    [data]
  )

  if (!cleaned.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        Données insuffisantes pour afficher le radar.
      </div>
    )
  }

  const size = 320
  const center = size / 2
  const radius = center - 32
  const levels = 4
  const angleSlice = (Math.PI * 2) / cleaned.length
  const startAngle = -Math.PI / 2

  const polarPoint = (value: number, index: number, localRadius = radius) => {
    const angle = startAngle + angleSlice * index
    const scaled = (value / CLAMP_MAX) * localRadius
    const x = center + scaled * Math.cos(angle)
    const y = center + scaled * Math.sin(angle)
    return { x, y }
  }

  const formatPoints = (points: Array<{ x: number; y: number }>) =>
    points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ")

  const outlinePoints = formatPoints(cleaned.map((_, index) => polarPoint(CLAMP_MAX, index)))

  const gridPolygons = Array.from({ length: levels }, (_, levelIndex) => {
    const levelRadius = radius * ((levelIndex + 1) / levels)
    const points = formatPoints(cleaned.map((_, index) => polarPoint(CLAMP_MAX, index, levelRadius)))
    const opacity = (levelIndex + 1) / (levels * 3)
    return { points, opacity }
  })

  const datasetPoints = {
    current: cleaned.map((entry, index) => polarPoint(entry.current, index)),
    alternative: cleaned.map((entry, index) => polarPoint(entry.alternative, index))
  }

  const axisLines = cleaned.map((entry, index) => {
    const edge = polarPoint(CLAMP_MAX, index)
    return {
      criteria: entry.criteria,
      x: edge.x,
      y: edge.y
    }
  })

  const labelOffset = 18
  const labels = cleaned.map((entry, index) => {
    const angle = startAngle + angleSlice * index
    const x = center + (radius + labelOffset) * Math.cos(angle)
    const y = center + (radius + labelOffset) * Math.sin(angle)

    const textAnchor =
      Math.abs(Math.cos(angle)) < 0.35 ? "middle" : Math.cos(angle) > 0 ? "start" : "end"
    const dominantBaseline =
      Math.abs(Math.sin(angle)) < 0.35 ? "middle" : Math.sin(angle) > 0 ? "hanging" : "alphabetic"

    return {
      criteria: entry.criteria,
      x,
      y,
      textAnchor: textAnchor as SvgTextAnchor,
      dominantBaseline: dominantBaseline as SvgDominantBaseline
    }
  })

  return (
    <div className="h-[320px] w-full">
      <svg viewBox={`0 0 ${size} ${size}`} aria-label="Radar comparatif" role="img">
        <title>Radar comparatif</title>
        <defs>
          <linearGradient id="radar-current" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#1e293b" stopOpacity={0.45} />
          </linearGradient>
          <linearGradient id="radar-alternative" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        <g>
          <polygon
            points={outlinePoints}
            fill="none"
            stroke="#CBD5F5"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
          {gridPolygons.map((polygon, index) => (
            <polygon
              key={`grid-${index}`}
              points={polygon.points}
              fill="#F8FAFC"
              opacity={polygon.opacity}
              stroke="none"
            />
          ))}
          {axisLines.map((axis, index) => (
            <line
              key={`axis-${axis.criteria}`}
              x1={center}
              y1={center}
              x2={axis.x}
              y2={axis.y}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          ))}
          <polygon
            points={formatPoints(datasetPoints.current)}
            fill="url(#radar-current)"
            stroke="#0f172a"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
          <polygon
            points={formatPoints(datasetPoints.alternative)}
            fill="url(#radar-alternative)"
            stroke="#059669"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {cleaned.map((entry, index) => {
            const currentPoint = datasetPoints.current[index]
            const alternativePoint = datasetPoints.alternative[index]
            return (
              <g key={`dots-${entry.criteria}`}>
                <circle
                  cx={currentPoint.x}
                  cy={currentPoint.y}
                  r={3.5}
                  fill="#0f172a"
                  stroke="#fff"
                  strokeWidth={1}
                />
                <circle
                  cx={alternativePoint.x}
                  cy={alternativePoint.y}
                  r={3.5}
                  fill="#059669"
                  stroke="#fff"
                  strokeWidth={1}
                />
              </g>
            )
          })}
          {labels.map((label) => (
            <text
              key={`label-${label.criteria}`}
              x={label.x}
              y={label.y}
              textAnchor={label.textAnchor}
              dominantBaseline={label.dominantBaseline}
              className="fill-slate-500 text-[11px] font-medium uppercase tracking-wide"
            >
              {label.criteria}
            </text>
          ))}
        </g>

        <g transform={`translate(${center - 70}, ${size - 20})`}>
          <rect x={0} y={-12} width={12} height={12} rx={2} fill="url(#radar-current)" stroke="#0f172a" />
          <text x={18} y={-2} className="fill-slate-600 text-xs">
            {currentLabel}
          </text>
          <rect x={140} y={-12} width={12} height={12} rx={2} fill="url(#radar-alternative)" stroke="#059669" />
          <text x={158} y={-2} className="fill-slate-600 text-xs">
            {alternativeLabel}
          </text>
        </g>
      </svg>
    </div>
  )
}
