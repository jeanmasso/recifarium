import { useMemo } from 'react'

import type { Station } from '../../types/models'
import { useFilterState, useYearState } from '../../store'
import { StationSearch } from './StationSearch'
import { TimelineControls } from './TimelineControls'
import { YearSlider } from './YearSlider'

interface TopbarProps {
  stations: Station[]
  selectedStationId: string | null
  onSelectStation: (id: string) => void
  typeOptions: string[]
  siteOptions: string[]
  barCap: number
  onBarCapChange: (value: number) => void
}

export function Topbar({
  stations,
  selectedStationId,
  onSelectStation,
  typeOptions,
  siteOptions,
  barCap,
  onBarCapChange,
}: TopbarProps) {
  const { year, setYear } = useYearState()
  const { typeRecif, site, setTypeRecif, setSite, clearFilters } = useFilterState()

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === selectedStationId),
    [selectedStationId, stations],
  )

  return (
    <header className="topbar">
      <div className="topbar__title">
        <h1>Récifarium</h1>
        <p>Observatoire 3D des récifs coralliens — 2012–2024</p>
      </div>
      <div className="topbar__controls">
        <StationSearch stations={stations} value={selectedStation?.id ?? ''} onSelect={onSelectStation} />
        <YearSlider value={year} onChange={setYear} />
        <TimelineControls />
        <div className="topbar__filters">
          <label>
            Type de récif
            <select
              value={typeRecif ?? ''}
              onChange={(event) => setTypeRecif(event.target.value || undefined)}
            >
              <option value="">Tous</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Site
            <select value={site ?? ''} onChange={(event) => setSite(event.target.value || undefined)}>
              <option value="">Tous</option>
              {siteOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="topbar__filters-reset" onClick={() => clearFilters()}>
            Réinitialiser
          </button>
        </div>
        <div className="topbar__settings">
          <label htmlFor="bar-cap-input">Cap barres</label>
          <input
            id="bar-cap-input"
            type="range"
            min={50}
            max={400}
            step={10}
            value={barCap}
            onChange={(event) => onBarCapChange(Number(event.target.value))}
          />
          <span>{barCap}</span>
        </div>
      </div>
    </header>
  )
}
