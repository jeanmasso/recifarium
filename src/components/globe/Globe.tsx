import { GlobeCanvas } from './GlobeCanvas'
import { GlobeScene } from './GlobeScene'
import type { Station, StationSummary } from '../../types/models'

interface GlobeProps {
  stations: Station[]
  selectedStation: Station | null
  summary: StationSummary | null
  hoveredStation: Station | null
  onSelectStation: (id: string) => void
  onHoverStation?: (id: string | null) => void
  barCap: number
}

export function Globe({
  stations,
  selectedStation,
  summary,
  hoveredStation,
  onSelectStation,
  onHoverStation,
  barCap,
}: GlobeProps) {
  return (
    <GlobeCanvas>
      <GlobeScene
        stations={stations}
        selectedStation={selectedStation}
        summary={summary}
        hoveredStation={hoveredStation}
        onSelectStation={onSelectStation}
        onHoverStation={onHoverStation}
        barCap={barCap}
      />
    </GlobeCanvas>
  )
}
