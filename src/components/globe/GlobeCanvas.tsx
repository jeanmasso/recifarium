import { Suspense, type PropsWithChildren } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function GlobeCanvas({ children }: PropsWithChildren) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 45 }} shadows={false} dpr={[1, 2]}>
      <color attach="background" args={[0x010409]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} />
      <Suspense fallback={null}>{children}</Suspense>
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={6} rotateSpeed={0.6} zoomSpeed={0.6} />
    </Canvas>
  )
}
