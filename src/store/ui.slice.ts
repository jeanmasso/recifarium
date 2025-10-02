import type { StateCreator } from 'zustand'

import type { StoreState } from './types'

export interface UiSlice {
  drawerOpen: boolean
  bottomSheet: 'closed' | 'half' | 'full'
  setDrawerOpen: (open: boolean) => void
  setBottomSheet: (state: 'closed' | 'half' | 'full') => void
}

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (set) => ({
  drawerOpen: false,
  bottomSheet: 'closed',
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setBottomSheet: (state) => set({ bottomSheet: state }),
})
