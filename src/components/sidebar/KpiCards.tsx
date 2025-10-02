import type { StationSummary } from '../../types/models'

interface KpiCardsProps {
  summary: StationSummary
}

export function KpiCards({ summary }: KpiCardsProps) {
  const items = [
    {
      label: 'Total individus',
      value: summary.kpis.total.toLocaleString('fr-FR'),
    },
    summary.kpis.deltaVsPrev !== undefined
      ? {
          label: 'Δ vs N-1',
          value: `${summary.kpis.deltaVsPrev > 0 ? '+' : ''}${summary.kpis.deltaVsPrev}%`,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="kpi-cards">
      {items.map((item) => (
        <div key={item.label} className="kpi-card">
          <span className="kpi-card__label">{item.label}</span>
          <span className="kpi-card__value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
