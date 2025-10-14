import { useEffect, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type PerspectiveCamera } from 'three'

import { DEFAULT_TAXON_PALETTE } from '../../constants/palette'
import { EARTH_RADIUS } from '../../constants/globe'
import { lonLatToSphere } from '../../lib/geo'
import type { Station, StationSummary } from '../../types/models'
import { Bars3D } from './Bars3D'
import { Earth } from './Earth'
import { StationPins } from './StationPins'

interface GlobeSceneProps {
  stations: Station[]
  selectedStation: Station | null
  summary: StationSummary | null
  hoveredStation: Station | null
  onSelectStation: (id: string) => void
  onHoverStation?: (id: string | null) => void
  barCap: number
  focus?: { lon: number; lat: number; distance?: number }
}

const upVector = new Vector3(0, 1, 0)
const defaultCameraPosition = new Vector3(0, 0, 3)
const defaultTarget = new Vector3(0, 0, 0)

type ControlsLike = {
  target: Vector3
  update: () => void
}

export function GlobeScene({
  stations,
  selectedStation,
  summary,
  hoveredStation,
  onSelectStation,
  onHoverStation,
  barCap,
  focus,
}: GlobeSceneProps) {
  const { camera, controls } = useThree((state) => ({
    camera: state.camera as PerspectiveCamera,
    controls: (state as unknown as { controls?: ControlsLike }).controls,
  }))

  const targetPositionRef = useRef(new Vector3().copy(defaultCameraPosition))
  const lookAtRef = useRef(new Vector3().copy(defaultTarget))
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (focus) {
      const surface = lonLatToSphere(focus.lon, focus.lat, EARTH_RADIUS)
      const focusDistance = focus.distance ?? 2.4
      const focusPosition = lonLatToSphere(focus.lon, focus.lat, EARTH_RADIUS + focusDistance)

      lookAtRef.current.set(...surface)
      targetPositionRef.current.set(...focusPosition)

      if (!hasInitializedRef.current) {
        camera.position.copy(targetPositionRef.current)
        camera.lookAt(lookAtRef.current)
        camera.up.copy(upVector)
        hasInitializedRef.current = true
      }
      return
    }

    if (!selectedStation) {
      targetPositionRef.current.copy(defaultCameraPosition)
      lookAtRef.current.copy(defaultTarget)
      return
    }

    const surface = lonLatToSphere(selectedStation.lon, selectedStation.lat, EARTH_RADIUS)
    const focusPosition = lonLatToSphere(selectedStation.lon, selectedStation.lat, EARTH_RADIUS + 2.4)

    lookAtRef.current.set(...surface)
    targetPositionRef.current.set(...focusPosition)

    if (!hasInitializedRef.current) {
      camera.position.copy(targetPositionRef.current)
      camera.lookAt(lookAtRef.current)
      camera.up.copy(upVector)
      hasInitializedRef.current = true
    }
  }, [camera, focus, selectedStation])

  useFrame(() => {
    camera.position.lerp(targetPositionRef.current, 0.08)

    if (controls) {
      controls.target.lerp(lookAtRef.current, 0.12)
      controls.update()
    } else {
      camera.lookAt(lookAtRef.current)
    }
  })

  return (
    <>
      <Earth radius={EARTH_RADIUS} />
      <StationPins
        stations={stations}
        selectedId={selectedStation?.id}
        onSelect={onSelectStation}
        onHover={onHoverStation}
      />
      <Bars3D
        station={selectedStation}
        summary={summary}
        palette={DEFAULT_TAXON_PALETTE}
        cap={barCap}
      />
      {hoveredStation && <StationTooltip station={hoveredStation} />}
    </>
  )
}

interface TooltipProps {
  station: Station
}

function StationTooltip({ station }: TooltipProps) {
  const position = useMemo(() => {
    return lonLatToSphere(station.lon, station.lat, EARTH_RADIUS + 0.12)
  }, [station.lat, station.lon])

  return (
    <Html position={position} center distanceFactor={12} transform>
      <div className="station-tooltip">
        <strong>{station.nom}</strong>
        <span>{station.site}</span>
        <span>{station.typeRecif}</span>
      </div>
    </Html>
  )
}
