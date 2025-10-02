import type { Station } from '../../types/models'

interface RawStation {
  id: string
  nom?: string
  name?: string
  site?: string
  typeRecif?: string
  type?: string
  lat?: number
  lon?: number
  point_geo?: { lat: number; lon: number }
  profondeurMax?: number
  anneeDebut?: number
}

export function adaptStation(raw: RawStation): Station | null {
  const lat = raw.lat ?? raw.point_geo?.lat
  const lon = raw.lon ?? raw.point_geo?.lon

  if (!raw.id || typeof lat !== 'number' || typeof lon !== 'number') {
    return null
  }

  return {
    id: raw.id,
    nom: raw.nom ?? raw.name ?? 'Station sans nom',
    site: raw.site ?? 'Inconnu',
    typeRecif: raw.typeRecif ?? raw.type ?? 'N.D.',
    lat,
    lon,
    profondeurMax: raw.profondeurMax,
    anneeDebut: raw.anneeDebut,
  }
}

export function adaptStations(rawStations: RawStation[]): Station[] {
  return rawStations
    .map((raw) => adaptStation(raw))
    .filter((station): station is Station => Boolean(station))
}
