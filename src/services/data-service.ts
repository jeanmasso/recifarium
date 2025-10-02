import { env } from '../lib/env'
import {
  YEARS,
  type Station,
  type StationSummary,
  type TaxonSeries,
  type TaxonSeriesPoint,
  type Year,
} from '../types/models'
import { adaptStations } from './adapters/stations.adapter'
import { adaptSummaries } from './adapters/summary.adapter'
import { adaptSeriesCollection } from './adapters/series.adapter'
import { FALLBACK_PATHS, DATASETS } from './endpoints'
import { fetchDatasetRecords } from './data-gouv'
import { getJson } from './http'

interface StationRecordFields {
  code_station?: string
  codestation?: string
  station_id?: string
  id_station?: string
  id?: string
  nom?: string
  nom_station?: string
  station?: string
  site?: string
  commune?: string
  type_recif?: string
  typeRecif?: string
  type?: string
  latitude?: number
  longitude?: number
  lat?: number
  lon?: number
  geo_point_2d?: [number, number]
  point_geo?: { lat: number; lon: number }
  profondeur_max?: number
  profondeurmax?: number
  profondeur?: number
  profondeurMax?: number
  annee_debut?: number
  annee_installation?: number
  anneeDebut?: number
}

interface InvertebrateRecordFields {
  code_station?: string
  codestation?: string
  station_id?: string
  id_station?: string
  station?: string
  nom_station?: string
  campagne?: number
  annee?: number
  year?: number
  code_taxon?: string
  codetaxon?: string
  description_taxon?: string
  libelle_taxon?: string
  label?: string
  valeur?: number
  value?: number
  decompte?: number
  total?: number
}

const stationRecordsCache = new Map<string, InvertebrateRecordFields[]>()

const normalizeStationRecord = (fields: StationRecordFields): StationRecordFields => {
  const geoPoint = Array.isArray(fields.geo_point_2d)
    ? {
        lat: Number(fields.geo_point_2d[0]),
        lon: Number(fields.geo_point_2d[1]),
      }
    : fields.point_geo

  const id =
    getStationId(fields) ??
    trimValue(fields.nom) ??
    trimValue(fields.id)

  return {
    id,
    nom: fields.nom ?? fields.nom_station ?? fields.station ?? fields.id,
    site: fields.site ?? fields.commune,
    typeRecif: fields.type_recif ?? fields.type,
    lat: fields.lat ?? fields.latitude ?? geoPoint?.lat,
    lon: fields.lon ?? fields.longitude ?? geoPoint?.lon,
    point_geo: geoPoint,
    profondeurMax: fields.profondeur_max ?? fields.profondeurmax ?? fields.profondeur,
    anneeDebut: fields.annee_debut ?? fields.annee_installation,
  }
}

const trimValue = (value?: string) => (value ? String(value).trim() : undefined)
const normalizeKey = (value?: string) => {
  const trimmed = trimValue(value)
  return trimmed ? trimmed.toUpperCase() : undefined
}

const getStationId = (record: StationRecordFields | InvertebrateRecordFields): string | undefined =>
  trimValue(
    record.code_station ??
      record.codestation ??
      record.station_id ??
      record.id_station ??
      record.station ??
      record.nom_station,
  )

const getYearFromRecord = (record: InvertebrateRecordFields): Year | undefined => {
  const year = record.campagne ?? record.annee ?? record.year
  return YEARS.includes(year as Year) ? (year as Year) : undefined
}

const getTaxonCode = (record: InvertebrateRecordFields): string | undefined =>
  record.code_taxon ?? record.codetaxon ?? undefined

const getTaxonLabel = (record: InvertebrateRecordFields, fallback: string): string =>
  record.description_taxon ?? record.libelle_taxon ?? record.label ?? fallback

const getValueFromRecord = (record: InvertebrateRecordFields): number | null => {
  const value = record.decompte ?? record.valeur ?? record.value ?? record.total
  if (value === null || value === undefined) {
    return null
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const stationQueryParams = (stationId: string) => ({
  rows: 500,
  'refine.code_station': stationId,
  'refine.station': stationId,
  'refine.nom_station': stationId,
  'refine.station_id': stationId,
})

const summaryYearFilter = (records: InvertebrateRecordFields[], year: Year) =>
  records.filter((record) => getYearFromRecord(record) === year)

const aggregateSummary = (
  records: InvertebrateRecordFields[],
  stationId: string,
  year: Year,
): StationSummary | null => {
  const targetKey = normalizeKey(stationId) ?? stationId
  const filtered = summaryYearFilter(records, year).filter(
    (record) => normalizeKey(getStationId(record)) === targetKey,
  )
  if (filtered.length === 0) {
    return null
  }

  const barMap = new Map<string, { code: string; label: string; value: number }>()

  filtered.forEach((record) => {
    const code = getTaxonCode(record)
    if (!code) return
    const value = getValueFromRecord(record)
    if (value === null) return
    const label = getTaxonLabel(record, code)
    const entry = barMap.get(code)
    if (entry) {
      entry.value += value
    } else {
      barMap.set(code, { code, label, value })
    }
  })

  const bars = Array.from(barMap.values()).sort((a, b) => b.value - a.value)
  const total = bars.reduce((sum, bar) => sum + bar.value, 0)
  const topTaxa = bars.slice(0, 3)

  return {
    stationId,
    year,
    kpis: {
      total,
      topTaxa,
    },
    bars,
  }
}

const aggregateSeries = (records: InvertebrateRecordFields[], stationId: string): TaxonSeries[] => {
  const targetKey = normalizeKey(stationId) ?? stationId
  const seriesMap = new Map<string, { code: string; label: string; values: Map<Year, number> }>()

  records
    .filter((record) => normalizeKey(getStationId(record)) === targetKey)
    .forEach((record) => {
      const code = getTaxonCode(record)
      const year = getYearFromRecord(record)
      const value = getValueFromRecord(record)
      if (!code || !year || value === null) {
        return
      }

      const label = getTaxonLabel(record, code)
      const entry = seriesMap.get(code)
      if (entry) {
        entry.label = label
        entry.values.set(year, (entry.values.get(year) ?? 0) + value)
      } else {
        seriesMap.set(code, {
          code,
          label,
          values: new Map([[year, value]]),
        })
      }
    })

  const toPoints = (values: Map<Year, number>): TaxonSeriesPoint[] =>
    YEARS.map((year) => ({
      year,
      value: values.has(year) ? values.get(year)! : null,
    }))

  return Array.from(seriesMap.values())
    .map((entry) => ({
      stationId,
      code: entry.code,
      label: entry.label,
      points: toPoints(entry.values),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const getStationRecords = async (stationId: string): Promise<InvertebrateRecordFields[]> => {
  const trimmedId = trimValue(stationId)
  if (!trimmedId) {
    return []
  }

  const cacheKey = normalizeKey(trimmedId) ?? trimmedId

  if (stationRecordsCache.has(cacheKey)) {
    return stationRecordsCache.get(cacheKey) ?? []
  }

  const records = await fetchDatasetRecords<InvertebrateRecordFields>(
    DATASETS.invertebrates,
    stationQueryParams(trimmedId),
  )
  stationRecordsCache.set(cacheKey, records)
  return records
}

export async function fetchStations(): Promise<Station[]> {
  if (env.useFallback) {
    const payload = await getJson<unknown[]>(FALLBACK_PATHS.stations)
    return adaptStations(payload as never)
  }

  const records = await fetchDatasetRecords<StationRecordFields>(DATASETS.stations, { rows: 500 })
  const normalized = records.map((fields) => normalizeStationRecord(fields))
  return adaptStations(normalized as never)
}

export async function fetchStationSummary(stationId: string, year: Year): Promise<StationSummary | null> {
  if (env.useFallback) {
    const payload = await getJson<unknown[]>(FALLBACK_PATHS.summaries)
    const summaries = adaptSummaries(payload as never)
    return summaries.find((item) => item.stationId === stationId && item.year === year) ?? null
  }

  const trimmedId = trimValue(stationId)
  if (!trimmedId) {
    return null
  }

  const records = await getStationRecords(trimmedId)
  return aggregateSummary(records, trimmedId, year)
}

export async function fetchLatestSummary(stationId: string): Promise<StationSummary | null> {
  if (env.useFallback) {
    const payload = await getJson<unknown[]>(FALLBACK_PATHS.summaries)
    const summaries = adaptSummaries(payload as never)
    const stationSummaries = summaries.filter((item) => item.stationId === stationId)
    const sorted = stationSummaries.sort((a, b) => YEARS.indexOf(b.year) - YEARS.indexOf(a.year))
    return sorted[0] ?? null
  }

  const trimmedId = trimValue(stationId)
  if (!trimmedId) {
    return null
  }

  const records = await getStationRecords(trimmedId)
  for (const year of [...YEARS].reverse()) {
    const summary = aggregateSummary(records, trimmedId, year)
    if (summary) {
      return summary
    }
  }
  return null
}

export async function fetchStationSeries(stationId: string): Promise<TaxonSeries[]> {
  if (env.useFallback) {
    const payload = await getJson<unknown[]>(FALLBACK_PATHS.series)
    const seriesCollection = adaptSeriesCollection(payload as never)
    return seriesCollection.filter((item) => item.stationId === stationId)
  }

  const trimmedId = trimValue(stationId)
  if (!trimmedId) {
    return []
  }

  const records = await getStationRecords(trimmedId)
  return aggregateSeries(records, trimmedId)
}
