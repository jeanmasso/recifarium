import { useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D, Vector3 } from 'three'

import { DEFAULT_BAR_CAP, EARTH_RADIUS } from '../../constants/globe'
import { lonLatToSphere, surfaceNormal } from '../../lib/geo'
import type { Station, StationSummary } from '../../types/models'

const tempObject = new Object3D()
const tempColor = new Color()

interface Bars3DProps {
  station: Station | null
  summary: StationSummary | null
  palette: Record<string, string>
  radius?: number
  cap?: number
}

const SURFACE_OFFSET = 0.05
const RING_RADIUS = 0.12

export function Bars3D({
  station,
  summary,
  palette,
  radius = EARTH_RADIUS,
  cap = DEFAULT_BAR_CAP,
}: Bars3DProps) {
  const meshRef = useRef<InstancedMesh | null>(null)

  const bars = useMemo(() => summary?.bars ?? [], [summary])

  const normal = useMemo(() => {
    if (!station) return null
    return new Vector3(...surfaceNormal(station.lon, station.lat))
  }, [station])

  const basis = useMemo(() => {
    if (!normal) return null

    const up = new Vector3(0, 1, 0)
    let east = up.clone().cross(normal)
    if (east.lengthSq() < 1e-6) {
      east = new Vector3(1, 0, 0).cross(normal)
    }
    east.normalize()
    const north = normal.clone().cross(east).normalize()

    return { east, north }
  }, [normal])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !normal || !basis || !station) return

    const basePosition = new Vector3(...lonLatToSphere(station.lon, station.lat, radius + SURFACE_OFFSET))

    bars.forEach((bar, index) => {
      const amount = Math.max(0, Math.min(bar.value, cap))
      const height = (amount / cap) * 0.6 + 0.05
      const angle = (index / Math.max(1, bars.length)) * Math.PI * 2

      const radialOffset = basis.east
        .clone()
        .multiplyScalar(Math.cos(angle))
        .add(basis.north.clone().multiplyScalar(Math.sin(angle)))
        .multiplyScalar(RING_RADIUS)

      const position = basePosition.clone().add(radialOffset)
      const barNormal = position.clone().normalize()
      const center = position.clone().add(barNormal.clone().multiplyScalar(height / 2))

      tempObject.position.copy(center)
      tempObject.scale.setScalar(1)
      tempObject.scale.set(0.05, height, 0.05)
      tempObject.lookAt(center.clone().add(barNormal))
      tempObject.rotateX(Math.PI / 2)
      tempObject.updateMatrix()

      mesh.setMatrixAt(index, tempObject.matrix)

      const color = palette[bar.code] ?? '#6C7A89'
      mesh.setColorAt(index, tempColor.set(color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  }, [bars, basis, cap, normal, palette, radius, station])

  if (!station || !summary || !normal || !basis || bars.length === 0) {
    return null
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, bars.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
