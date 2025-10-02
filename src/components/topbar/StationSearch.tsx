import { useMemo, useState } from 'react'

import type { Station } from '../../types/models'

interface StationSearchProps {
  stations: Station[]
  value: string
  onSelect: (stationId: string) => void
}

export function StationSearch({ stations, value, onSelect }: StationSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const options = useMemo(() => {
    const token = query.trim().toLowerCase()
    if (!token) return stations
    return stations.filter((station) =>
      `${station.nom} ${station.site}`.toLowerCase().includes(token),
    )
  }, [query, stations])

  return (
    <div className="station-search">
      <label className="station-search__label" htmlFor="station-search-input">
        Station
      </label>
      <input
        id="station-search-input"
        className="station-search__input"
        type="search"
        placeholder="Chercher une station"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setOpen(nextQuery.trim().length > 0)
        }}
        onFocus={() => setOpen(query.trim().length > 0)}
        onBlur={() => {
          // Delay closing to allow click selection
          setTimeout(() => setOpen(false), 120)
        }}
      />
      {open && (
        <ul className="station-search__results">
          {options.slice(0, 6).map((station) => (
            <li key={station.id}>
              <button
                type="button"
                className={station.id === value ? 'is-active' : ''}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(station.nom)
                  setOpen(false)
                  onSelect(station.id)
                }}
              >
                <span className="station-search__name">{station.nom}</span>
                <span className="station-search__meta">{station.site}</span>
              </button>
            </li>
          ))}
          {options.length === 0 && <li className="station-search__empty">Aucune station</li>}
        </ul>
      )}
    </div>
  )
}
