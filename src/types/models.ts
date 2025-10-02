export type StationId = string

export type Year =
  | 2012
  | 2013
  | 2014
  | 2015
  | 2016
  | 2017
  | 2018
  | 2019
  | 2020
  | 2021
  | 2022
  | 2023
  | 2024

export const YEARS: Year[] = [
  2012,
  2013,
  2014,
  2015,
  2016,
  2017,
  2018,
  2019,
  2020,
  2021,
  2022,
  2023,
  2024,
]

export interface Station {
  id: StationId
  nom: string
  site: string
  typeRecif: string
  lat: number
  lon: number
  profondeurMax?: number
  anneeDebut?: number
}

export interface StationSummary {
  stationId: StationId
  year: Year
  kpis: {
    total: number
    topTaxa: { code: string; label: string; value: number }[]
    deltaVsPrev?: number
  }
  bars: { code: string; label: string; value: number }[]
}

export interface TaxonSeriesPoint {
  year: Year
  value: number | null
}

export interface TaxonSeries {
  stationId: StationId
  code: string
  label: string
  points: TaxonSeriesPoint[]
}

export type TaxonPalette = Record<string, string>
