import type { FiltersSlice } from './filters.slice'
import type { StationSlice } from './station.slice'
import type { UiSlice } from './ui.slice'
import type { YearSlice } from './year.slice'

export type StoreState = StationSlice & YearSlice & FiltersSlice & UiSlice
