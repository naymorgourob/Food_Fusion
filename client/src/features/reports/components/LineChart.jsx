const WIDTH = 600
const HEIGHT = 260
const PADDING = { top: 20, right: 12, bottom: 28, left: 8 }
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

/**
 * Minimal, dependency-free SVG line chart — same reasoning as BarChart.jsx
 * for not installing a charting library. A 10%-opacity area wash under the
 * line (never a saturated fill) plus an end-point value label, per the
 * "lines carry the value at the end" convention — every other point's
 * exact value is still available on hover via the native <title>.
 */
export function LineChart({
  data,
  formatValue = (value) => String(value),
  color = 'var(--color-accent)',
  emptyMessage = 'No data for this period.',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center text-sm text-ink-faint">{emptyMessage}</div>
    )
  }

  const maxValue = Math.max(...data.map((point) => point.value), 1)
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0
  const baselineY = PADDING.top + innerHeight

  const points = data.map((point, index) => ({
    ...point,
    x: PADDING.left + index * stepX,
    y: maxValue > 0 ? baselineY - (point.value / maxValue) * innerHeight : baselineY,
  }))

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
  const labelEvery = Math.max(1, Math.ceil(data.length / 8))
  const lastPoint = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Line chart">
      {GRID_FRACTIONS.map((fraction) => {
        const y = PADDING.top + innerHeight * (1 - fraction)
        return (
          <line
            key={fraction}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={y}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        )
      })}

      <path d={areaPath} fill={color} opacity="0.1" stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((point, index) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4" fill={color} stroke="var(--color-surface)" strokeWidth="2">
            <title>{`${point.shortLabel ?? point.label}: ${formatValue(point.value)}`}</title>
          </circle>
          {index % labelEvery === 0 && (
            <text
              x={point.x}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-ink-faint)"
            >
              {point.shortLabel ?? point.label}
            </text>
          )}
        </g>
      ))}

      <text
        x={lastPoint.x}
        y={Math.max(12, lastPoint.y - 10)}
        textAnchor="end"
        fontSize="11"
        fontWeight="600"
        fill="var(--color-ink)"
      >
        {formatValue(lastPoint.value)}
      </text>
    </svg>
  )
}
