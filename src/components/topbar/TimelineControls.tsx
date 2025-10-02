import { useEffect } from 'react'

import { YEARS } from '../../types/models'
import { useStore, useYearState } from '../../store'

const BASE_DELAY = 1800

export function TimelineControls() {
  const { year, playing, speed, play, pause, setSpeed } = useYearState()

  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      const state = useStore.getState()
      const index = YEARS.indexOf(state.year)
      const nextIndex = (index + 1) % YEARS.length
      state.setYear(YEARS[nextIndex])
    }, BASE_DELAY / speed)

    return () => {
      clearInterval(interval)
    }
  }, [playing, speed])

  return (
    <div className="timeline-controls">
      <button type="button" onClick={() => (playing ? pause() : play())}>
        {playing ? 'Pause' : 'Lecture'}
      </button>
      <button
        type="button"
        className={speed === 2 ? 'is-active' : ''}
        onClick={() => setSpeed(speed === 2 ? 1 : 2)}
      >
        x{speed}
      </button>
      <span className="timeline-controls__year">{year}</span>
    </div>
  )
}
