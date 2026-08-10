const WIDTH = 600
const HEIGHT = 260
const PADDING = { top: 20, right: 12, bottom: 28, left: 8 }
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

/**
 * Minimal, dependency-free SVG bar chart — no charting library installed
 * for this (per this part's scope: "only install a chart library if
 * required," and a handful of <rect> elements covers a single-series
 * magnitude chart just fine). Hover tooltips are the browser's own
 * <title> element — zero extra code, still genuinely accessible on hover.
 *
 * `barColors[index]` lets a caller tint each bar individually (the
 * Reservation Summary chart reuses this app's existing status colors,
 * one per bar) while `color` covers the single-hue case (Orders/Revenue).
 * `showAllValueLabels` is only meant for a handful of bars (e.g. the 4
 * reservation statuses) — with many bars (daily data) only every Nth
 * x-axis label is drawn, so the axis never floods with text.
 */
export function BarChart({
  data,
  formatValue = (value) => String(value),
  color = 'var(--color-accent)',
  barColors,
  showAllValueLabels = false,
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
  const barSlot = innerWidth / data.length
  const barWidth = Math.min(24, barSlot * 0.6)
  const labelEvery = Math.max(1, Math.ceil(data.length / 8))

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Bar chart">
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

      {data.map((point, index) => {
        const barHeight = maxValue > 0 ? (point.value / maxValue) * innerHeight : 0
        const x = PADDING.left + index * barSlot + (barSlot - barWidth) / 2
        const y = PADDING.top + innerHeight - barHeight
        const fill = barColors ? barColors[index] : color

        return (
          <g key={point.label}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx="4" fill={fill}>
              <title>{`${point.shortLabel ?? point.label}: ${formatValue(point.value)}`}</title>
            </rect>
            {showAllValueLabels && (
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--color-ink)"
              >
                {formatValue(point.value)}
              </text>
            )}
            {index % labelEvery === 0 && (
              <text
                x={x + barWidth / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-ink-faint)"
              >
                {point.shortLabel ?? point.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
