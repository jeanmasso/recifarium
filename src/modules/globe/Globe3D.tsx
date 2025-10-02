import { useEffect, useMemo, useRef } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { Color, InstancedMesh, Object3D, Quaternion, SRGBColorSpace, Vector3 } from 'three'

import { lonLatToSphere, surfaceNormal } from '../../lib/geo'

const DEFAULT_TEXTURE = '/textures/earth.jpg'
const DEFAULT_PIN_ALTITUDE = 0.01
const SPHERE_SEGMENTS = [128, 64] as const
const PIN_COLOR = new Color('#58a6ff')
const PIN_HOVER_COLOR = new Color('#ffffff')
export type LonLat = { lon: number; lat: number }

export interface Globe3DProps {
  textureUrl?: string
  points?: LonLat[]
  onPointHover?: (index: number | null) => void
  onPointClick?: (index: number) => void
  autoRotate?: boolean
  pinAltitude?: number
  minDistance?: number
  maxDistance?: number
}

const pinDummy = new Object3D()
const upVector = new Vector3(0, 1, 0)

const applyPins = (
  mesh: InstancedMesh,
  points: LonLat[],
  altitude: number,
) => {
  points.forEach((point, index) => {
    const normal = new Vector3(...surfaceNormal(point.lon, point.lat))
    const position = new Vector3(...lonLatToSphere(point.lon, point.lat, 1 + altitude))

    const orientation = new Quaternion().setFromUnitVectors(upVector, normal)

    pinDummy.position.copy(position)
    pinDummy.quaternion.copy(orientation)
    pinDummy.scale.setScalar(1)
    pinDummy.updateMatrix()

    mesh.setMatrixAt(index, pinDummy.matrix)
    mesh.setColorAt(index, PIN_COLOR)
  })

  mesh.instanceMatrix.needsUpdate = true
  mesh.instanceColor && (mesh.instanceColor.needsUpdate = true)
}

export function Globe3D(props: Globe3DProps) {
  return (
    <div className="globe3d">
      <Canvas camera={{ position: [0, 0, 2.2], fov: 45 }} dpr={[1, 2]}>
        <GlobeScene {...props} />
      </Canvas>
    </div>
  )
}

interface GlobeSceneProps extends Globe3DProps {}

function GlobeScene({
  textureUrl = DEFAULT_TEXTURE,
  points = [],
  onPointHover,
  onPointClick,
  autoRotate = true,
  pinAltitude = DEFAULT_PIN_ALTITUDE,
  minDistance = 0.45,
  maxDistance = 4,
}: GlobeSceneProps) {
  const pinsRef = useRef<InstancedMesh>(null)
  const hoverIndexRef = useRef<number | null>(null)

  const texture = useTexture(textureUrl)

  useEffect(() => {
    if (texture) {
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = 8
    }
  }, [texture])

  useEffect(() => {
    const mesh = pinsRef.current
    if (!mesh) return

    mesh.count = Math.max(points.length, 1)
    applyPins(mesh, points, pinAltitude)
    hoverIndexRef.current = null
  }, [pinAltitude, points])

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()

    const mesh = pinsRef.current
    if (!mesh) return

    const instanceId = event.instanceId ?? null
    if (instanceId === hoverIndexRef.current) return

    if (hoverIndexRef.current !== null) {
      mesh.setColorAt(hoverIndexRef.current, PIN_COLOR)
    }

    if (instanceId !== null) {
      mesh.setColorAt(instanceId, PIN_HOVER_COLOR)
      onPointHover?.(instanceId)
    } else {
      onPointHover?.(null)
    }

    mesh.instanceColor && (mesh.instanceColor.needsUpdate = true)
    hoverIndexRef.current = instanceId
  }

  const handlePointerOut = () => {
    const mesh = pinsRef.current
    if (!mesh) return

    if (hoverIndexRef.current !== null) {
      mesh.setColorAt(hoverIndexRef.current, PIN_COLOR)
      mesh.instanceColor && (mesh.instanceColor.needsUpdate = true)
    }

    hoverIndexRef.current = null
    onPointHover?.(null)
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const instanceId = event.instanceId
    if (typeof instanceId === 'number') {
      onPointClick?.(instanceId)
    }
  }

  const autoRotateSpeed = useMemo(() => (autoRotate ? 0.2 : 0), [autoRotate])

  return (
    <>
      <color attach="background" args={[0x010409]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 2, 1]} intensity={0.8} />
      <directionalLight position={[-2, -1, -1]} intensity={0.4} color="#3a5a9b" />
      <group>
        <mesh>
          <sphereGeometry args={[1, ...SPHERE_SEGMENTS]} />
          <meshStandardMaterial map={texture} metalness={0} roughness={1} />
        </mesh>
        <instancedMesh
          ref={pinsRef}
          args={[undefined, undefined, Math.max(points.length, 1)]}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <coneGeometry args={[0.015, 0.06, 12]} />
          <meshStandardMaterial color={PIN_COLOR} />
        </instancedMesh>
      </group>
      <OrbitControls
        enablePan={false}
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />
    </>
  )
}
