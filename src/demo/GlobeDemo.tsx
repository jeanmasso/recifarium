import { useEffect, useMemo, useState } from 'react'

import { Globe3D, type LonLat } from '../modules/globe/Globe3D'

interface TestPoint extends LonLat {
  name: string
}

export function GlobeDemo() {
  const [points, setPoints] = useState<TestPoint[]>([])
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/data/test-points.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<TestPoint[]>
      })
      .then((payload) => {
        if (!active) return
        setPoints(payload)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      })
    return () => {
      active = false
    }
  }, [])

  const hoverLabel = useMemo(() => {
    if (hoverIndex === null) return 'Survolez un point pour voir son nom.'
    const point = points[hoverIndex]
    return point ? point.name : ''
  }, [hoverIndex, points])

  return (
    <div className="globe-demo">
      <div className="globe-demo__hud">
        <h2>Globe 3D — Démo</h2>
        <p>{hoverLabel}</p>
      </div>
      <Globe3D
        points={points}
        onPointHover={setHoverIndex}
        onPointClick={(index) => {
          const point = points[index]
          if (point) {
            console.info('Point sélectionné:', point)
          }
        }}
      />
      {error && <div className="globe-demo__error">{error}</div>}
    </div>
  )
}
