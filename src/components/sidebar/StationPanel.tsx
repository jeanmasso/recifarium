import { DEFAULT_TAXON_PALETTE } from '../../constants/palette'
import type { Station, StationSummary, TaxonSeries, Year } from '../../types/models'
import { KpiCards } from './KpiCards'
import { Sparklines } from './Sparklines'
import { TaxaTable } from './TaxaTable'

export interface StationPanelProps {
  station: Station | null
  summary: StationSummary | null
  series: TaxonSeries[]
  activeYear: Year
  loading: boolean
  error: Error | null
}

interface StationPanelDrawerProps extends StationPanelProps {
  open: boolean
  variant: 'desktop' | 'mobile'
  onClose: () => void
  onExplore3D?: () => void
}

const SKELETON_ROWS = Array.from({ length: 4 })

export function StationPanelDrawer({
  open,
  variant,
  onClose,
  onExplore3D,
  ...panelProps
}: StationPanelDrawerProps) {
  return (
    <div className={`station-panel-drawer${open ? ' is-open' : ''}`} data-variant={variant} aria-hidden={!open}>
      <button type="button" className="station-panel-drawer__backdrop" onClick={onClose} aria-hidden />
      <aside className="station-panel" role="dialog" aria-modal="true">
        <header className="station-panel__header">
          <div className="station-panel__titles">
            <h2>Station</h2>
            {panelProps.station && (
              <span className="station-panel__subtitle">{panelProps.station.nom}</span>
            )}
          </div>
          <button type="button" className="station-panel__close" onClick={onClose} aria-label="Fermer le panneau">
            ×
          </button>
        </header>
        <div className="station-panel__content">
          <StationPanelContent {...panelProps} />
        </div>
        <footer className="station-panel__footer">
          <button type="button" className="station-panel__cta" onClick={onExplore3D}>
            Explorer en 3D
          </button>
        </footer>
      </aside>
    </div>
  )
}

function StationPanelContent({ station, summary, series, activeYear, loading, error }: StationPanelProps) {
  if (loading) {
    return (
      <div className="station-panel__skeleton">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--meta" />
        <div className="skeleton__grid">
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
        </div>
        <div className="skeleton skeleton--table" />
        <div className="skeleton__list">
          {SKELETON_ROWS.map((_, index) => (
            <div key={index} className="skeleton skeleton--sparkline" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="station-panel__state station-panel__state--error">
        <p>Données indisponibles — passage en mode local recommandé.</p>
        <small>{error.message}</small>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="station-panel__state station-panel__state--empty">
        <p>Sélectionnez une station via la carte ou la recherche pour afficher ses indicateurs.</p>
      </div>
    )
  }

  return (
    <div className="station-panel__body">
      <div className="station-panel__meta">
        <span>{station.site}</span>
        <span>{station.typeRecif}</span>
        <span>
          {station.lat.toFixed(3)}° / {station.lon.toFixed(3)}°
        </span>
      </div>
      {summary ? (
        <KpiCards summary={summary} />
      ) : (
        <p className="station-panel__hint">Aucune donnée pour l’année sélectionnée.</p>
      )}
      {summary && <TaxaTable summary={summary} palette={DEFAULT_TAXON_PALETTE} />}
      <section>
        <h3>Séries temporelles</h3>
        <Sparklines series={series} activeYear={summary?.year ?? activeYear} palette={DEFAULT_TAXON_PALETTE} />
      </section>
    </div>
  )
}
