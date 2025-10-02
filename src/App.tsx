import { useState } from 'react'

import { Globe3D } from './modules/globe/Globe3D'
import { TEST_POINTS } from './data/testPoints'

import './App.css'

function App() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  return (
    <div className="app app--globe-only">
      <header className="globe-only__hud">
        <h1>Récifarium — Globe 3D</h1>
        <p>{hoverIndex === null ? 'Survolez un point' : TEST_POINTS[hoverIndex]?.name ?? ''}</p>
      </header>
      <Globe3D
        points={TEST_POINTS}
        autoRotate
        onPointHover={setHoverIndex}
        onPointClick={(index) => {
          const point = TEST_POINTS[index]
          if (point) {
            console.info('Point sélectionné', point)
          }
        }}
      />
    </div>
  )
}

export default App
