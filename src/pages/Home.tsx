import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LatLngBoundsExpression } from 'leaflet'

import { DEFAULT_BAR_CAP } from '../constants/globe'
import { DEFAULT_TAXON_PALETTE } from '../constants/palette'
import { Legend } from '../components/legend/Legend'
import { IntroGlobe } from '../components/globe/IntroGlobe'
import { LeafletStage, type LeafletStageHandle } from '../components/leaflet/LeafletStage'
import { ResponsiveShell } from '../components/layout/ResponsiveShell'
import { StationPanelDrawer } from '../components/sidebar/StationPanel'
import { Topbar } from '../components/topbar/Topbar'
import { useStations } from '../hooks/useStations'
import { useStationSeries } from '../hooks/useStationSeries'
import { useStationSummary } from '../hooks/useStationSummary'
import { useFilterState, useStationState, useUiState, useYearState } from '../store'

const NC_BOUNDS: LatLngBoundsExpression = [
  [-23.5, 162.5],
  [-18.5, 169.0],
]

type Stage = 'globe' | 'leaflet'

const BAR_CAP_MIN = 60
const BAR_CAP_MAX = 320

const computeVariant = () => {
  if (typeof window === 'undefined') {
    return 'desktop' as const
  }
  return window.matchMedia('(max-width: 900px)').matches ? ('mobile' as const) : ('desktop' as const)
}

export function Home() {
  const [stage, setStage] = useState<Stage>('globe')
  const [barCap, setBarCap] = useState(DEFAULT_BAR_CAP)
  const [panelVariant, setPanelVariant] = useState<'desktop' | 'mobile'>(computeVariant)

  const leafletRef = useRef<LeafletStageHandle>(null)
  const hasFitBoundsRef = useRef(false)
  const lastFocusedStationIdRef = useRef<string | null>(null)
  const openedFromUrlRef = useRef(false)

  const { data: stations, loading: stationsLoading, error: stationsError } = useStations()

  const { stationId, setStation, clearStation } = useStationState()
  const { year } = useYearState()
  const { typeRecif, site } = useFilterState()
  const { drawerOpen, setDrawerOpen, setBottomSheet } = useUiState()

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useStationSummary({ stationId, year })
  const {
    data: series,
    loading: seriesLoading,
    error: seriesError,
  } = useStationSeries(stationId)

  const panelLoading = summaryLoading || seriesLoading
  const panelError = summaryError ?? seriesError ?? null

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === stationId) ?? null,
    [stationId, stations],
  )

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const typeOk = typeRecif ? station.typeRecif === typeRecif : true
      const siteOk = site ? station.site === site : true
      return typeOk && siteOk
    })
  }, [stations, site, typeRecif])

  const typeOptions = useMemo(() => {
    const set = new Set<string>()
    stations.forEach((station) => {
      if (station.typeRecif) {
        set.add(station.typeRecif)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [stations])

  const siteOptions = useMemo(() => {
    const set = new Set<string>()
    stations.forEach((station) => {
      if (station.site) {
        set.add(station.site)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [stations])

  useEffect(() => {
    const handleResize = () => {
      setPanelVariant(computeVariant())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (stage === 'leaflet' && !hasFitBoundsRef.current) {
      if (leafletRef.current) {
        leafletRef.current.fitBounds(NC_BOUNDS, { padding: [48, 48] })
        leafletRef.current.invalidateSize()
      }
      hasFitBoundsRef.current = true
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'leaflet') {
      return
    }

    if (selectedStation && selectedStation.id !== lastFocusedStationIdRef.current) {
      leafletRef.current?.flyToStation(selectedStation)
      lastFocusedStationIdRef.current = selectedStation.id
    }

    if (!selectedStation) {
      lastFocusedStationIdRef.current = null
    }
  }, [selectedStation, stage])

  const openPanel = useCallback(() => {
    setDrawerOpen(true)
    if (panelVariant === 'mobile') {
      setBottomSheet('half')
    } else {
      setBottomSheet('full')
    }
  }, [panelVariant, setBottomSheet, setDrawerOpen])

  const closePanel = useCallback(() => {
    setDrawerOpen(false)
    setBottomSheet('closed')
    clearStation()
  }, [clearStation, setBottomSheet, setDrawerOpen])

  const transitionToLeaflet = useCallback(() => {
    setStage('leaflet')
  }, [])

  const handleSelectStation = useCallback(
    (id: string) => {
      if (!id) return
      setStage('leaflet')
      setStation(id)
      openPanel()
    },
    [openPanel, setStation],
  )

  const handleMapBackgroundClick = useCallback(() => {
    closePanel()
  }, [closePanel])

  const handleExplore3D = useCallback(() => {
    hasFitBoundsRef.current = false
    setStage('globe')
  }, [])

  const mapOverlay = useMemo(() => {
    if (stationsLoading) {
      return (
        <div className="loading-overlay" role="status" aria-live="polite">
          Chargement des stations…
        </div>
      )
    }
    if (stationsError) {
      return (
        <div className="loading-overlay loading-overlay--error" role="alert">
          <strong>Impossible de charger les stations.</strong>
          <span>{stationsError.message}</span>
        </div>
      )
    }
    return null
  }, [stationsError, stationsLoading])

  const handleBarCapChange = useCallback((value: number) => {
    setBarCap(Math.min(Math.max(value, BAR_CAP_MIN), BAR_CAP_MAX))
  }, [])

  useEffect(() => {
    if (!stationId) {
      openedFromUrlRef.current = false
      return
    }

    if (!openedFromUrlRef.current && stations.length > 0) {
      openedFromUrlRef.current = true
      setStage('leaflet')
      openPanel()
    }
  }, [openPanel, setStage, stationId, stations.length])

  return (
    <>
      <Topbar
        stations={stations}
        selectedStationId={stationId}
        onSelectStation={handleSelectStation}
        typeOptions={typeOptions}
        siteOptions={siteOptions}
        barCap={Math.min(Math.max(barCap, BAR_CAP_MIN), BAR_CAP_MAX)}
        onBarCapChange={handleBarCapChange}
      />
      <ResponsiveShell
        stage={stage}
        globe={
          <IntroGlobe
            stations={stations}
            barCap={barCap}
            loading={stationsLoading}
            onIntroEnd={transitionToLeaflet}
            onSkipIntro={transitionToLeaflet}
            onSelectStation={handleSelectStation}
          />
        }
        map={
          <LeafletStage
            ref={leafletRef}
            filteredStations={filteredStations}
            selectedStationId={stationId}
            visible={stage === 'leaflet'}
            onSelectStation={handleSelectStation}
            onBackgroundClick={handleMapBackgroundClick}
          />
        }
        sidebar={
          <StationPanelDrawer
            open={drawerOpen}
            variant={panelVariant}
            onClose={closePanel}
            onExplore3D={handleExplore3D}
            station={selectedStation}
            summary={summary}
            series={series}
            activeYear={year}
            loading={panelLoading}
            error={panelError}
          />
        }
        legend={<Legend palette={DEFAULT_TAXON_PALETTE} />}
        overlay={mapOverlay}
      />
    </>
  )
}
