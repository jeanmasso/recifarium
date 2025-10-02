import type { ReactNode } from 'react'

interface ResponsiveShellProps {
  globe: ReactNode
  sidebar: ReactNode
  legend?: ReactNode
}

export function ResponsiveShell({ globe, sidebar, legend }: ResponsiveShellProps) {
  return (
    <div className="responsive-shell">
      <div className="responsive-shell__globe">{globe}</div>
      <div className="responsive-shell__sidebar">
        {legend && <div className="responsive-shell__legend">{legend}</div>}
        {sidebar}
      </div>
    </div>
  )
}
