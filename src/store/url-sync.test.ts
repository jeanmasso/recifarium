import { describe, expect, it, beforeEach, vi } from 'vitest'
import { create } from 'zustand'

import { createFiltersSlice } from './filters.slice'
import { createStationSlice } from './station.slice'
import type { StoreState } from './types'
import { createUiSlice } from './ui.slice'
import { createYearSlice } from './year.slice'
import { bindUrlSync, bootstrapFromUrl } from './url-sync'

const createTestStore = () =>
  create<StoreState>()((...args) => ({
    ...createStationSlice(...args),
    ...createYearSlice(...args),
    ...createFiltersSlice(...args),
    ...createUiSlice(...args),
  }))

describe('url-sync helpers', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('bootstraps the store from query parameters', () => {
    const store = createTestStore()
    window.history.replaceState(null, '', '/?stationId=ST001&year=2019&typeRecif=Lagoon&site=Noumea')

    bootstrapFromUrl(store)

    const state = store.getState()
    expect(state.stationId).toBe('ST001')
    expect(state.year).toBe(2019)
    expect(state.typeRecif).toBe('Lagoon')
    expect(state.site).toBe('Noumea')
  })

  it('updates the URL when relevant store slices change', () => {
    const store = createTestStore()
    bindUrlSync(store)

    const replaceSpy = vi.spyOn(window.history, 'replaceState')
    replaceSpy.mockClear()

    store.setState({
      stationId: 'ST050',
      year: 2022,
      typeRecif: 'Barrière',
      site: 'Bourail',
    })

    expect(replaceSpy).toHaveBeenCalled()
    const current = new URL(window.location.href)
    expect(current.searchParams.get('stationId')).toBe('ST050')
    expect(current.searchParams.get('year')).toBe('2022')
    expect(current.searchParams.get('typeRecif')).toBe('Barrière')
    expect(current.searchParams.get('site')).toBe('Bourail')

    replaceSpy.mockRestore()
  })
})
