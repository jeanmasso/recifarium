import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_BAR_CAP } from '../../constants/globe'
import type { Station } from '../../types/models'
import { Globe } from './Globe'

const NC_FOCUS = {
  lon: 165.5,
  lat: -21.5,
  distance: 2.2,
}

interface IntroGlobeProps {
  stations: Station[]
  barCap?: number
  loading: boolean
  onIntroEnd: () => void
  onSkipIntro?: () => void
  onSelectStation?: (stationId: string) => void
}

const INTRO_DURATION_MS = 4800

export function IntroGlobe({
  stations,
  barCap = DEFAULT_BAR_CAP,
  loading,
  onIntroEnd,
  onSkipIntro,
  onSelectStation,
}: IntroGlobeProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const hoveredStation = useMemo(
    () => stations.find((station) => station.id === hoveredId) ?? null,
    [hoveredId, stations],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onIntroEnd()
    }, INTRO_DURATION_MS)

    return () => window.clearTimeout(timeout)
  }, [onIntroEnd])

  useEffect(() => {
    if (!onSkipIntro) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onSkipIntro()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSkipIntro])

  return (
    <div className="intro-globe">
      <Globe
        stations={stations}
        selectedStation={null}
        summary={null}
        hoveredStation={hoveredStation}
        onSelectStation={(id) => {
          onSelectStation?.(id)
          onIntroEnd()
        }}
        onHoverStation={(id) => setHoveredId(id)}
        barCap={barCap}
        focus={NC_FOCUS}
        autoRotate
      />
      <div className="intro-globe__hud">
        <div className="intro-globe__text">
          <p>Exploration 3D du lagon de Nouvelle-Calédonie</p>
          <span>{loading ? 'Chargement des stations…' : 'Transition vers la carte interactive'}</span>
        </div>
        <button type="button" onClick={onSkipIntro} className="intro-globe__skip">
          Passer l’intro (Esc)
        </button>
      </div>
    </div>
  )
}
