import type { ReactNode } from 'react'

type Stage = 'globe' | 'leaflet'

interface ResponsiveShellProps {
  stage: Stage
  globe: ReactNode
  map: ReactNode
  sidebar: ReactNode
  legend?: ReactNode
  overlay?: ReactNode
}

export function ResponsiveShell({ stage, globe, map, sidebar, legend, overlay }: ResponsiveShellProps) {
  return (
    <div className="responsive-shell" data-stage={stage}>
      <div className="responsive-shell__main">
        <div className={`responsive-shell__stage responsive-shell__stage--globe${stage === 'globe' ? ' is-active' : ''}`}>
          {globe}
        </div>
        <div className={`responsive-shell__stage responsive-shell__stage--map${stage === 'leaflet' ? ' is-active' : ''}`}>
          {map}
        </div>
        {overlay && <div className="responsive-shell__overlay">{overlay}</div>}
      </div>
      <div className="responsive-shell__sidebar">
        {legend && <div className="responsive-shell__legend">{legend}</div>}
        {sidebar}
      </div>
    </div>
  )
}
