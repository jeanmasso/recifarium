import { useMemo } from 'react'

import { YEARS, type TaxonSeries, type Year } from '../../types/models'

interface SparklinesProps {
  series: TaxonSeries[]
  activeYear: Year
  palette: Record<string, string>
}

const WIDTH = 120
const HEIGHT = 36

export function Sparklines({ series, activeYear, palette }: SparklinesProps) {
  if (series.length === 0) {
    return <p className="sparklines__empty">Séries temporelles indisponibles.</p>
  }

  return (
    <div className="sparklines">
      {series.map((entry) => (
        <SparklineRow key={entry.code} entry={entry} activeYear={activeYear} color={palette[entry.code] ?? '#6C7A89'} />
      ))}
    </div>
  )
}

interface SparklineRowProps {
  entry: TaxonSeries
  activeYear: Year
  color: string
}

function SparklineRow({ entry, activeYear, color }: SparklineRowProps) {
  const { points, maxValue } = useMemo(() => {
    const values = entry.points.map((point) => point.value ?? 0)
    const maxV = Math.max(1, ...values)
    return { points: entry.points, maxValue: maxV }
  }, [entry.points])

  const path = useMemo(() => {
    return points
      .map((point, index) => {
        const x = (index / (YEARS.length - 1)) * WIDTH
        const value = point.value ?? 0
        const y = HEIGHT - (value / maxValue) * HEIGHT
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }, [maxValue, points])

  const activePoint = points.find((point) => point.year === activeYear)
  const activeIndex = activePoint ? YEARS.indexOf(activePoint.year) : -1
  const activeCoords = (() => {
    if (activeIndex === -1) return null
    const x = (activeIndex / (YEARS.length - 1)) * WIDTH
    const value = activePoint?.value ?? 0
    const y = HEIGHT - (value / maxValue) * HEIGHT
    return { x, y }
  })()

  return (
    <div className="sparkline">
      <div className="sparkline__header">
        <span className="sparkline__label">{entry.label}</span>
        <span className="sparkline__value">{activePoint?.value ?? 'N.D.'}</span>
      </div>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <path d={path} stroke={color} strokeWidth="2" fill="none" />
        {activeCoords && <circle cx={activeCoords.x} cy={activeCoords.y} r={3} fill={color} />}
      </svg>
    </div>
  )
}
