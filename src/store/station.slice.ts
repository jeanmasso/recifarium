import type { StateCreator } from 'zustand'

import type { StationId } from '../types/models'
import type { StoreState } from './types'

export interface StationSlice {
  stationId: StationId | null
  setStation: (id: StationId) => void
  clearStation: () => void
}

export const createStationSlice: StateCreator<StoreState, [], [], StationSlice> = (set) => ({
  stationId: null,
  setStation: (id) => set({ stationId: id }),
  clearStation: () => set({ stationId: null }),
})
