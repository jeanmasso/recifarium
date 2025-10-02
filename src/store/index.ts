import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { createFiltersSlice } from './filters.slice'
import { createStationSlice } from './station.slice'
import type { StoreState } from './types'
import { createUiSlice } from './ui.slice'
import { createYearSlice } from './year.slice'

export const useStore = create<StoreState>()(
  subscribeWithSelector((...args) => ({
    ...createStationSlice(...args),
    ...createYearSlice(...args),
    ...createFiltersSlice(...args),
    ...createUiSlice(...args),
  })),
)

export const useStationState = () =>
  useStore(
    useShallow((state) => ({
      stationId: state.stationId,
      setStation: state.setStation,
      clearStation: state.clearStation,
    })),
  )

export const useYearState = () =>
  useStore(
    useShallow((state) => ({
      year: state.year,
      playing: state.playing,
      speed: state.speed,
      setYear: state.setYear,
      play: state.play,
      pause: state.pause,
      setSpeed: state.setSpeed,
    })),
  )

export const useFilterState = () =>
  useStore(
    useShallow((state) => ({
      typeRecif: state.typeRecif,
      site: state.site,
      setTypeRecif: state.setTypeRecif,
      setSite: state.setSite,
      clearFilters: state.clearFilters,
    })),
  )

export const useUiState = () =>
  useStore(
    useShallow((state) => ({
      drawerOpen: state.drawerOpen,
      bottomSheet: state.bottomSheet,
      setDrawerOpen: state.setDrawerOpen,
      setBottomSheet: state.setBottomSheet,
    })),
  )
