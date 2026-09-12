import { useState } from 'react'

const WIDTH = 640
const HEIGHT = 260
const PADDING = { top: 24, right: 20, bottom: 32, left: 16 }
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

export function BarChart({
  data = [],
  formatValue = (value) => String(value),
  color = '#e5a93c', // gold-500 default
  barColors,
  showAllValueLabels = false,
  emptyMessage = 'No data for this time frame.',
}) {
  const [hoveredBar, setHoveredBar] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-rule bg-canvas/40 text-center">
        <p className="text-xs font-medium text-body-muted">{emptyMessage}</p>
        <span className="mt-1 text-[11px] text-body-faint">Try adjusting your date or filter range</span>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((point) => point.value), 1)
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom
  const barSlot = innerWidth / data.length
  const barWidth = Math.min(32, Math.max(12, barSlot * 0.55))
  const labelEvery = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Bar chart"
      >
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
              className="text-rule stroke-[1] opacity-40"
            />
          )
        })}

        {/* Bars */}
        {data.map((point, index) => {
          const barHeight = maxValue > 0 ? (point.value / maxValue) * innerHeight : 0
          const x = PADDING.left + index * barSlot + (barSlot - barWidth) / 2
          const y = PADDING.top + innerHeight - barHeight
          const fill = barColors ? barColors[index % barColors.length] : color
          const isHovered = hoveredBar?.label === point.label

          return (
            <g
              key={point.label}
              onMouseEnter={() => setHoveredBar({ ...point, x, y })}
              onMouseLeave={() => setHoveredBar(null)}
              className="cursor-pointer"
            >
              {/* Invisible full-slot hover catcher */}
              <rect
                x={PADDING.left + index * barSlot}
                y={PADDING.top}
                width={barSlot}
                height={innerHeight}
                fill="transparent"
              />

              {/* Visible Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="5"
                fill={fill}
                className={`transition-all duration-150 ${
                  isHovered ? 'opacity-100 filter drop-shadow-md brightness-110' : 'opacity-85'
                }`}
              />

              {/* Value label above bar if configured */}
              {showAllValueLabels && point.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-body text-[11px] font-bold"
                >
                  {formatValue(point.value)}
                </text>
              )}

              {/* X-axis label */}
              {index % labelEvery === 0 && (
                <text
                  x={x + barWidth / 2}
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
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredBar && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-rule bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur-md"
          style={{
            left: `${((hoveredBar.x + barWidth / 2) / WIDTH) * 100}%`,
            top: `${(hoveredBar.y / HEIGHT) * 100 - 4}%`,
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-semibold text-body-muted">
              {hoveredBar.shortLabel ?? hoveredBar.label}
            </span>
            <span className="font-display text-xs font-bold text-body">
              {formatValue(hoveredBar.value)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
