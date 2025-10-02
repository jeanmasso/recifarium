import { DEFAULT_TAXON_PALETTE } from '../../constants/palette'
import type { Station, StationSummary, TaxonSeries, Year } from '../../types/models'
import { KpiCards } from './KpiCards'
import { Sparklines } from './Sparklines'
import { TaxaTable } from './TaxaTable'

interface StationPanelProps {
  station: Station | null
  summary: StationSummary | null
  series: TaxonSeries[]
  activeYear: Year
  loading: boolean
  error: Error | null
}

export function StationPanel({ station, summary, series, activeYear, loading, error }: StationPanelProps) {
  if (loading) {
    return (
      <aside className="station-panel station-panel--loading">
        <h2>Station</h2>
        <p>Chargement des données…</p>
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="station-panel station-panel--error">
        <h2>Station</h2>
        <p>Erreur lors du chargement : {error.message}</p>
      </aside>
    )
  }

  if (!station) {
    return (
      <aside className="station-panel station-panel--empty">
        <h2>Station</h2>
        <p>Sélectionnez une station sur le globe ou via la recherche.</p>
      </aside>
    )
  }

  return (
    <aside className="station-panel">
      <header>
        <h2>{station.nom}</h2>
        <p className="station-panel__meta">
          <span>{station.site}</span>
          <span>{station.typeRecif}</span>
        </p>
      </header>
      {summary ? <KpiCards summary={summary} /> : <p>Aucun résumé pour cette année.</p>}
      {summary && <TaxaTable summary={summary} palette={DEFAULT_TAXON_PALETTE} />}
      <section>
        <h3>Séries temporelles</h3>
        <Sparklines series={series} activeYear={summary?.year ?? activeYear} palette={DEFAULT_TAXON_PALETTE} />
      </section>
    </aside>
  )
}
