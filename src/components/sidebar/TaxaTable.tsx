import { useMemo, useState } from 'react'

import type { StationSummary } from '../../types/models'

type SortKey = 'label' | 'value'

type SortDirection = 'asc' | 'desc'

interface TaxaTableProps {
  summary: StationSummary
  palette: Record<string, string>
}

export function TaxaTable({ summary, palette }: TaxaTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('value')
  const [direction, setDirection] = useState<SortDirection>('desc')

  const rows = useMemo(() => {
    const sorted = [...summary.bars].sort((a, b) => {
      const factor = direction === 'asc' ? 1 : -1
      if (sortKey === 'value') {
        return factor * (a.value - b.value)
      }
      return factor * a.label.localeCompare(b.label)
    })
    return sorted
  }, [direction, sortKey, summary.bars])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDirection(key === 'value' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="taxa-table">
      <div className="taxa-table__header">
        <button type="button" onClick={() => toggleSort('label')}>
          Taxon {sortKey === 'label' ? (direction === 'asc' ? '▲' : '▼') : ''}
        </button>
        <button type="button" onClick={() => toggleSort('value')}>
          Valeur {sortKey === 'value' ? (direction === 'asc' ? '▲' : '▼') : ''}
        </button>
      </div>
      <ul>
        {rows.map((row) => (
          <li key={row.code}>
            <span className="taxa-table__swatch" style={{ backgroundColor: palette[row.code] ?? '#6C7A89' }} />
            <span className="taxa-table__label">{row.label}</span>
            <span className="taxa-table__value">{row.value.toLocaleString('fr-FR')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
