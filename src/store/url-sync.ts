import type { StoreApi } from 'zustand'

import { YEARS, type Year } from '../types/models'
import type { StoreState } from './types'

const PARAM_STATION = 'stationId'
const PARAM_YEAR = 'year'
const PARAM_TYPE = 'typeRecif'
const PARAM_SITE = 'site'

interface UrlState {
  stationId?: string
  year?: Year
  typeRecif?: string
  site?: string
}

const isClient = typeof window !== 'undefined'

const parseYear = (value: string | null): Year | undefined => {
  if (!value) return undefined
  const year = Number(value) as Year
  return YEARS.includes(year) ? year : undefined
}

const readUrlState = (): UrlState => {
  if (!isClient) {
    return {}
  }

  const params = new URLSearchParams(window.location.search)
  return {
    stationId: params.get(PARAM_STATION) ?? undefined,
    year: parseYear(params.get(PARAM_YEAR)),
    typeRecif: params.get(PARAM_TYPE) ?? undefined,
    site: params.get(PARAM_SITE) ?? undefined,
  }
}

const writeUrlState = (state: UrlState) => {
  if (!isClient) {
    return
  }

  const params = new URLSearchParams(window.location.search)

  updateParam(params, PARAM_STATION, state.stationId)
  updateParam(params, PARAM_YEAR, state.year ? String(state.year) : undefined)
  updateParam(params, PARAM_TYPE, state.typeRecif)
  updateParam(params, PARAM_SITE, state.site)

  const search = params.toString()
  const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', newUrl)
}

const updateParam = (params: URLSearchParams, key: string, value: string | undefined) => {
  if (value && value.length > 0) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
}

const areEqual = (a: UrlState | null, b: UrlState) =>
  !!a && a.stationId === b.stationId && a.year === b.year && a.typeRecif === b.typeRecif && a.site === b.site

export const bootstrapFromUrl = (store: StoreApi<StoreState>) => {
  const urlState = readUrlState()

  if (urlState.stationId) {
    store.setState({ stationId: urlState.stationId })
  }

  if (urlState.year) {
    store.setState({ year: urlState.year })
  }

  if (urlState.typeRecif) {
    store.setState({ typeRecif: urlState.typeRecif })
  }

  if (urlState.site) {
    store.setState({ site: urlState.site })
  }
}

export const bindUrlSync = (store: StoreApi<StoreState>) => {
  if (!isClient) {
    return
  }

  let previous: UrlState | null = null

  store.subscribe((state) => {
    const next: UrlState = {
      stationId: state.stationId ?? undefined,
      year: state.year,
      typeRecif: state.typeRecif,
      site: state.site,
    }

    if (!areEqual(previous, next)) {
      previous = { ...next }
      writeUrlState(next)
    }
  })
}
