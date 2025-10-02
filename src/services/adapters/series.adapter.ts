import { YEARS, type TaxonSeries, type TaxonSeriesPoint, type Year } from '../../types/models'

interface RawSeriesPoint {
  year?: number
  campagne?: number
  value: number | null
}

interface RawSeries {
  stationId?: string
  station_id?: string
  code: string
  label?: string
  points?: RawSeriesPoint[]
  values?: RawSeriesPoint[]
}

const toYear = (value: number | undefined): Year | undefined => {
  if (!value) {
    return undefined
  }
  return YEARS.includes(value as Year) ? (value as Year) : undefined
}

const fillPoints = (rawPoints: RawSeriesPoint[]): TaxonSeriesPoint[] => {
  return YEARS.map((year) => {
    const match = rawPoints.find((point) => toYear(point.year ?? point.campagne) === year)
    return {
      year,
      value: match ? match.value : null,
    }
  })
}

export function adaptSeries(raw: RawSeries): TaxonSeries | null {
  const stationId = raw.stationId ?? raw.station_id
  if (!stationId) {
    return null
  }

  const rawPoints = raw.points ?? raw.values ?? []

  return {
    stationId,
    code: raw.code,
    label: raw.label ?? raw.code,
    points: fillPoints(rawPoints),
  }
}

export function adaptSeriesCollection(rawCollection: RawSeries[]): TaxonSeries[] {
  return rawCollection
    .map((raw) => adaptSeries(raw))
    .filter((series): series is TaxonSeries => Boolean(series))
}
