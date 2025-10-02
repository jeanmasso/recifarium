import type { StationSummary, Year } from '../../types/models'

interface RawSummary {
  stationId?: string
  station_id?: string
  year?: number
  campagne?: number
  kpis?: StationSummary['kpis']
  bars?: StationSummary['bars']
  total?: number
  topTaxa?: StationSummary['kpis']['topTaxa']
  deltaVsPrev?: number
  values?: { code: string; label?: string; value: number }[]
}

const isYear = (value: unknown): value is Year => typeof value === 'number'

export function adaptSummary(raw: RawSummary): StationSummary | null {
  const stationId = raw.stationId ?? raw.station_id
  const year = (raw.year ?? raw.campagne) as Year | undefined

  if (!stationId || !isYear(year)) {
    return null
  }

  const bars = (raw.bars ?? raw.values ?? []).map((item) => ({
    code: item.code,
    label: item.label ?? item.code,
    value: item.value,
  }))

  const topTaxa = (raw.kpis?.topTaxa ?? raw.topTaxa ?? bars.slice(0, 3)).map(
    (taxon) => ({
      code: taxon.code,
      label: taxon.label ?? taxon.code,
      value: taxon.value,
    })
  )

  return {
    stationId,
    year,
    kpis: {
      total: raw.kpis?.total ?? raw.total ?? bars.reduce((sum, bar) => sum + bar.value, 0),
      topTaxa,
      deltaVsPrev: raw.kpis?.deltaVsPrev ?? raw.deltaVsPrev,
    },
    bars,
  }
}

export function adaptSummaries(rawSummaries: RawSummary[]): StationSummary[] {
  return rawSummaries
    .map((raw) => adaptSummary(raw))
    .filter((summary): summary is StationSummary => Boolean(summary))
}
