import { Vector3 } from 'three'

const toRad = (degrees: number) => (degrees * Math.PI) / 180

export const lonLatToSphere = (lon: number, lat: number, radius = 1) => {
  const lambda = toRad(lon)
  const phi = toRad(lat)

  const x = radius * Math.cos(phi) * Math.cos(lambda)
  const y = radius * Math.sin(phi)
  const z = -radius * Math.cos(phi) * Math.sin(lambda)

  return [x, y, z] as const
}

export const surfaceNormal = (lon: number, lat: number) => {
  const [x, y, z] = lonLatToSphere(lon, lat, 1)
  const length = Math.hypot(x, y, z) || 1
  return [x / length, y / length, z / length] as const
}

export const setVectorFromLonLat = (vector: Vector3, lon: number, lat: number, radius = 1) => {
  const [x, y, z] = lonLatToSphere(lon, lat, radius)
  vector.set(x, y, z)
  return vector
}
