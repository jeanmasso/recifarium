import type { StateCreator } from 'zustand'

import type { StoreState } from './types'

export interface FiltersSlice {
  typeRecif?: string
  site?: string
  setTypeRecif: (value?: string) => void
  setSite: (value?: string) => void
  clearFilters: () => void
}

export const createFiltersSlice: StateCreator<StoreState, [], [], FiltersSlice> = (set) => ({
  typeRecif: undefined,
  site: undefined,
  setTypeRecif: (value) => set({ typeRecif: value }),
  setSite: (value) => set({ site: value }),
  clearFilters: () => set({ typeRecif: undefined, site: undefined }),
})
