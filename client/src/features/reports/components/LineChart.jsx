import { useState } from 'react'

const WIDTH = 640
const HEIGHT = 260
const PADDING = { top: 24, right: 20, bottom: 32, left: 16 }
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

/**
 * Premium SVG Line / Area Chart.
 * Dependency-free, fully responsive, dark-mode aware with smooth gradients,
 * interactive hover tooltips, and clear gridlines.
 */
export function LineChart({
  data = [],
  formatValue = (value) => String(value),
  color = '#10b981', // emerald-500 default
  gradientId = 'chart-gradient',
  emptyMessage = 'No data recorded for this time frame.',
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-rule bg-canvas/40 text-center">
        <p className="text-xs font-medium text-body-muted">{emptyMessage}</p>
        <span className="mt-1 text-[11px] text-body-faint">Try adjusting your date or filter range</span>
      </div>
    )
  }

  const values = data.map((point) => point.value)
  const maxValue = Math.max(...values, 1)
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth / 2
  const baselineY = PADDING.top + innerHeight

  const points = data.map((point, index) => ({
    ...point,
    x: data.length > 1 ? PADDING.left + index * stepX : PADDING.left + innerWidth / 2,
    y: maxValue > 0 ? baselineY - (point.value / maxValue) * innerHeight : baselineY,
  }))

  const linePath =
    points.length === 1
      ? `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`
      : points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  const areaPath =
    points.length === 1
      ? `M ${points[0].x - 20} ${baselineY} L ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y} L ${points[0].x + 20} ${baselineY} Z`
      : `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`

  const labelEvery = Math.max(1, Math.ceil(data.length / 7))
  const lastPoint = points[points.length - 1]

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Revenue chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {GRID_FRACTIONS.map((fraction) => {
          const y = PADDING.top + innerHeight * (1 - fraction)
          return (
            <line
              key={fraction}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-rule stroke-[1] stroke-dasharray-[4,4] opacity-50"
            />
          )
        })}

        {/* Gradient fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line stroke */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => {
          const isHovered = hoveredPoint?.label === point.label
          return (
            <g
              key={point.label}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            >
              {/* Invisible larger hover hit area */}
              <circle cx={point.x} cy={point.y} r="14" fill="transparent" />

              {/* Visible dot */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? 6 : 4}
                fill={color}
                stroke="var(--color-card, #ffffff)"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* X-axis tick labels */}
              {index % labelEvery === 0 && (
                <text
                  x={point.x}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-body-faint text-[10px] font-medium"
                >
                  {point.shortLabel ?? point.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Last point badge if not hovered */}
        {!hoveredPoint && lastPoint && (
          <g>
            <rect
              x={lastPoint.x - 38}
              y={Math.max(6, lastPoint.y - 24)}
              width="50"
              height="18"
              rx="6"
              fill={color}
              className="opacity-90 shadow-sm"
            />
            <text
              x={lastPoint.x - 13}
              y={Math.max(18, lastPoint.y - 11)}
              textAnchor="middle"
              className="fill-white text-[10px] font-bold"
            >
              {formatValue(lastPoint.value)}
            </text>
          </g>
        )}
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-rule bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur-md"
          style={{
            left: `${(hoveredPoint.x / WIDTH) * 100}%`,
            top: `${(hoveredPoint.y / HEIGHT) * 100 - 4}%`,
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-body-muted">
              {hoveredPoint.shortLabel ?? hoveredPoint.label}
            </span>
            <span className="font-display text-xs font-bold text-body">
              {formatValue(hoveredPoint.value)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
