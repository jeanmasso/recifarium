import { useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D, Vector3 } from 'three'
import type { ThreeEvent } from '@react-three/fiber'

import { PIN_HEIGHT, PIN_RADIUS } from '../../constants/globe'
import { lonLatToSphere, surfaceNormal } from '../../lib/geo'
import type { Station } from '../../types/models'

const tempObject = new Object3D()
const tempColor = new Color()
const UP = new Vector3(0, 1, 0)

interface StationPinsProps {
  stations: Station[]
  selectedId?: string | null
  radius?: number
  onHover?: (id: string | null) => void
  onSelect?: (id: string) => void
}

const BASE_COLOR = new Color('#58a6ff')
const SELECTED_COLOR = new Color('#f88c32')
const HOVER_COLOR = new Color('#ffffff')

export function StationPins({
  stations,
  selectedId,
  radius = 1,
  onHover,
  onSelect,
}: StationPinsProps) {
  const meshRef = useRef<InstancedMesh | null>(null)
  const hoverIndexRef = useRef<number | null>(null)

  const idByIndex = useMemo(() => stations.map((station) => station.id), [stations])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    stations.forEach((station, index) => {
      const normal = new Vector3(...surfaceNormal(station.lon, station.lat))
      const position = new Vector3(...lonLatToSphere(station.lon, station.lat, radius + PIN_HEIGHT / 2))

      tempObject.position.copy(position)
      tempObject.scale.setScalar(1)
      tempObject.quaternion.setFromUnitVectors(UP, normal)
      tempObject.updateMatrix()
      mesh.setMatrixAt(index, tempObject.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  }, [radius, stations])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    stations.forEach((station, index) => {
      const color = station.id === selectedId ? SELECTED_COLOR : BASE_COLOR
      mesh.setColorAt(index, tempColor.copy(color))
    })

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  }, [selectedId, stations])

  const updateHoverColor = (index: number | null) => {
    const mesh = meshRef.current
    if (!mesh) return

    if (hoverIndexRef.current !== null && hoverIndexRef.current !== undefined) {
      const prevId = idByIndex[hoverIndexRef.current]
      const isSelected = prevId === selectedId
      mesh.setColorAt(
        hoverIndexRef.current,
        tempColor.copy(isSelected ? SELECTED_COLOR : BASE_COLOR),
      )
    }

    if (index !== null) {
      mesh.setColorAt(index, tempColor.copy(HOVER_COLOR))
    }

    hoverIndexRef.current = index
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const index = event.instanceId ?? null
    if (index === null) return
    const stationId = idByIndex[index]
    onHover?.(stationId)
    updateHoverColor(index)
  }

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    updateHoverColor(null)
    onHover?.(null)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const index = event.instanceId ?? null
    if (index === null) return
    const stationId = idByIndex[index]
    onSelect?.(stationId)
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, stations.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <cylinderGeometry args={[PIN_RADIUS, PIN_RADIUS, PIN_HEIGHT, 8]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
