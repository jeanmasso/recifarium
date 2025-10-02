import type { StateCreator } from 'zustand'

import { YEARS, type Year } from '../types/models'
import type { StoreState } from './types'

const DEFAULT_YEAR = YEARS.at(-1) ?? 2024

export interface YearSlice {
  year: Year
  playing: boolean
  speed: 1 | 2
  setYear: (year: Year) => void
  play: () => void
  pause: () => void
  setSpeed: (speed: 1 | 2) => void
}

export const createYearSlice: StateCreator<StoreState, [], [], YearSlice> = (set) => ({
  year: DEFAULT_YEAR,
  playing: false,
  speed: 1,
  setYear: (year) => set({ year }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  setSpeed: (speed) => set({ speed }),
})
