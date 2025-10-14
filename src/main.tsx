import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

import { useStore } from './store'
import { bindUrlSync, bootstrapFromUrl } from './store/url-sync'

bootstrapFromUrl(useStore)
bindUrlSync(useStore)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
