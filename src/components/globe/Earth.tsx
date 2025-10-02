import { useEffect } from 'react'
import { useTexture } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { SRGBColorSpace } from 'three'

type EarthProps = ThreeElements['mesh'] & {
  radius?: number
  textureUrl?: string
}

export function Earth({ radius = 1, textureUrl = '/textures/earth.jpg', ...props }: EarthProps) {
  const map = useTexture(textureUrl)

  useEffect(() => {
    if (map) {
      map.colorSpace = SRGBColorSpace
      map.anisotropy = 8
    }
  }, [map])

  return (
    <mesh {...props} scale={radius}>
      <sphereGeometry args={[1, 128, 64]} />
      <meshStandardMaterial map={map} metalness={0} roughness={1} />
    </mesh>
  )
}
