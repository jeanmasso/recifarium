interface LegendProps {
  palette: Record<string, string>
}

export function Legend({ palette }: LegendProps) {
  const entries = Object.entries(palette)

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="legend">
      {entries.map(([code, color]) => (
        <div key={code} className="legend__item">
          <span className="legend__color" style={{ backgroundColor: color }} />
          <span className="legend__label">{code}</span>
        </div>
      ))}
    </div>
  )
}
