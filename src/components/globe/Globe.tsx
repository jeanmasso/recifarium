import { GlobeCanvas } from './GlobeCanvas'
import { GlobeScene } from './GlobeScene'
import type { Station, StationSummary } from '../../types/models'

interface FocusTarget {
  lon: number
  lat: number
  distance?: number
}

interface GlobeProps {
  stations: Station[]
  selectedStation: Station | null
  summary: StationSummary | null
  hoveredStation: Station | null
  onSelectStation: (id: string) => void
  onHoverStation?: (id: string | null) => void
  barCap: number
  focus?: FocusTarget
  autoRotate?: boolean
}

export function Globe({
  stations,
  selectedStation,
  summary,
  hoveredStation,
  onSelectStation,
  onHoverStation,
  barCap,
  focus,
  autoRotate = false,
}: GlobeProps) {
  return (
    <GlobeCanvas autoRotate={autoRotate}>
      <GlobeScene
        stations={stations}
        selectedStation={selectedStation}
        summary={summary}
        hoveredStation={hoveredStation}
        onSelectStation={onSelectStation}
        onHoverStation={onHoverStation}
        barCap={barCap}
        focus={focus}
      />
    </GlobeCanvas>
  )
}
