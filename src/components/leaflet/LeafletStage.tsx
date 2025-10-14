import type { CSSProperties } from 'react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvent,
} from 'react-leaflet'
import {
  divIcon,
  type DivIcon,
  type FitBoundsOptions,
  type LatLngBoundsExpression,
  type LatLngExpression,
  type LeafletMouseEvent,
  type Map as LeafletMap,
  type MapOptions,
  type TileLayerOptions,
} from 'leaflet'

import type { Station } from '../../types/models'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const CLUSTER_THRESHOLD = 80
const CLUSTER_STEP_DEGREES = 0.3

const INITIAL_CENTER: LatLngExpression = [-21.3, 165.5]
const MAP_OPTIONS: MapOptions = {
  center: INITIAL_CENTER,
  zoom: 6,
  minZoom: 4,
  maxZoom: 14,
  scrollWheelZoom: true,
  attributionControl: true,
  zoomControl: false,
}

const TILE_OPTIONS: TileLayerOptions = {
  attribution: TILE_ATTRIBUTION,
}

export interface LeafletStageHandle {
  fitBounds: (bounds: LatLngBoundsExpression, options?: FitBoundsOptions) => void
  flyToStation: (station: Station, zoom?: number) => void
  invalidateSize: () => void
}

interface LeafletStageProps {
  filteredStations: Station[]
  selectedStationId: string | null
  visible: boolean
  onSelectStation?: (stationId: string) => void
  onBackgroundClick?: () => void
  onReady?: () => void
}

interface StationCluster {
  id: string
  lat: number
  lon: number
  count: number
  stations: Station[]
}

const mapStyles = (visible: boolean): CSSProperties => ({
  opacity: visible ? 1 : 0,
  pointerEvents: visible ? 'auto' : 'none',
})

const createStationIcon = (selected: boolean): DivIcon =>
  divIcon({
    className: `leaflet-stage__pin${selected ? ' is-selected' : ''}`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -18],
  })

const createClusterIcon = (count: number): DivIcon =>
  divIcon({
    className: 'leaflet-stage__cluster-icon',
    html: `<span>${count}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

export const LeafletStage = forwardRef<LeafletStageHandle, LeafletStageProps>(function LeafletStage(
  { filteredStations, selectedStationId, visible, onSelectStation, onBackgroundClick, onReady },
  ref,
) {
  const mapRef = useRef<LeafletMap | null>(null)
  const [isReady, setReady] = useState(false)
  const mapInstanceRef = useCallback((instance: LeafletMap | null) => {
    if (instance) {
      mapRef.current = instance
      setReady(true)
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      fitBounds: (bounds, options) => {
        mapRef.current?.fitBounds(bounds, options)
      },
      flyToStation: (station, zoom = Math.max(mapRef.current?.getZoom() ?? 8, 10)) => {
        mapRef.current?.flyTo([station.lat, station.lon], zoom, { duration: 0.75 })
      },
      invalidateSize: () => {
        mapRef.current?.invalidateSize()
      },
    }),
    [],
  )

  useEffect(() => {
    if (visible && mapRef.current) {
      const timeout = window.setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 220)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [visible])

  useEffect(() => {
    if (isReady) {
      onReady?.()
    }
  }, [isReady, onReady])

  const shouldCluster = filteredStations.length > CLUSTER_THRESHOLD

  const clusters = useMemo(() => {
    if (!shouldCluster) {
      return []
    }

    const buckets = new Map<string, StationCluster>()

    filteredStations.forEach((station) => {
      const keyLat = Math.round(station.lat / CLUSTER_STEP_DEGREES)
      const keyLon = Math.round(station.lon / CLUSTER_STEP_DEGREES)
      const key = `${keyLat}:${keyLon}`

      const bucket = buckets.get(key)
      if (bucket) {
        bucket.count += 1
        bucket.lat += station.lat
        bucket.lon += station.lon
        bucket.stations.push(station)
      } else {
        buckets.set(key, {
          id: key,
          count: 1,
          lat: station.lat,
          lon: station.lon,
          stations: [station],
        })
      }
    })

    return Array.from(buckets.values()).map((bucket) => ({
      ...bucket,
      lat: bucket.lat / bucket.count,
      lon: bucket.lon / bucket.count,
    }))
  }, [filteredStations, shouldCluster])

  const markerItems = useMemo(() => {
    if (shouldCluster) {
      return clusters
    }
    return filteredStations
  }, [clusters, filteredStations, shouldCluster])

  return (
    <div className="leaflet-stage" style={mapStyles(visible)} aria-hidden={!visible}>
      <MapContainer
        {...MAP_OPTIONS}
        className="leaflet-stage__map"
        ref={mapInstanceRef}
      >
        <TileLayer url={TILE_URL} {...TILE_OPTIONS} />
        <MapClickCatcher onBackgroundClick={onBackgroundClick} />
        <MarkerLayer
          items={markerItems}
          clustered={shouldCluster}
          selectedStationId={selectedStationId}
          onSelectStation={onSelectStation}
        />
      </MapContainer>
    </div>
  )
})

interface MarkerLayerProps {
  items: Array<Station | StationCluster>
  selectedStationId: string | null
  clustered: boolean
  onSelectStation?: (stationId: string) => void
}

const MarkerLayer = ({ items, clustered, selectedStationId, onSelectStation }: MarkerLayerProps) => {
  const map = useMap()
  const defaultIcon = useMemo(() => createStationIcon(false), [])
  const selectedIcon = useMemo(() => createStationIcon(true), [])
  const clusterIconsRef = useRef(new Map<number, DivIcon>())

  const getClusterIcon = useCallback((count: number) => {
    const cached = clusterIconsRef.current.get(count)
    if (cached) {
      return cached
    }
    const icon = createClusterIcon(count)
    clusterIconsRef.current.set(count, icon)
    return icon
  }, [])

  const handleClusterClick = useCallback(
    (cluster: StationCluster) => (event: LeafletMouseEvent) => {
      event.originalEvent.preventDefault()
      event.originalEvent.stopPropagation()

      if (cluster.count === 1) {
        const [station] = cluster.stations
        if (station) {
          onSelectStation?.(station.id)
        }
        return
      }

      const nextZoom = Math.min((map.getZoom() ?? 6) + 1.5, 13)
      map.flyTo([cluster.lat, cluster.lon], nextZoom, { duration: 0.6 })
    },
    [map, onSelectStation],
  )

  const handleStationClick = useCallback(
    (station: Station) => (event: LeafletMouseEvent) => {
      event.originalEvent.preventDefault()
      event.originalEvent.stopPropagation()
      onSelectStation?.(station.id)
    },
    [onSelectStation],
  )

  return (
    <>
      {items.map((item) => {
        if (clustered) {
          const cluster = item as StationCluster
          const position: LatLngExpression = [cluster.lat, cluster.lon]

          return (
            <Marker
              key={cluster.id}
              position={position}
              icon={getClusterIcon(cluster.count)}
              eventHandlers={{
                click: handleClusterClick(cluster),
              }}
              title={`Groupe de ${cluster.count} stations`}
              keyboard
            >
              <Tooltip direction="top" offset={[0, -8]} className="leaflet-stage__tooltip">
                <div className="leaflet-stage__tooltip-content">
                  <strong>{cluster.count} stations</strong>
                  <span>Approchez pour détailler</span>
                </div>
              </Tooltip>
            </Marker>
          )
        }

        const station = item as Station
        const position: LatLngExpression = [station.lat, station.lon]
        const isSelected = station.id === selectedStationId

        return (
          <Marker
            key={station.id}
            position={position}
            icon={isSelected ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: handleStationClick(station),
            }}
            keyboard
            title={`${station.nom} — ${station.site}`}
          >
            <Tooltip direction="top" offset={[0, -12]} className="leaflet-stage__tooltip">
              <div className="leaflet-stage__tooltip-content">
                <strong>{station.nom}</strong>
                <span>{station.site}</span>
              </div>
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}

const MapClickCatcher = ({ onBackgroundClick }: { onBackgroundClick?: () => void }) => {
  useMapEvent('click', () => {
    onBackgroundClick?.()
  })

  return null
}
