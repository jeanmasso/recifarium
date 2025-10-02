# Récifarium — Pack de démarrage dev (pour Codex)

> Objectif : fournir à Codex les éléments concrets pour **démarrer le dev** de l’app front-only (React + Three.js) et livrer un MVP conforme au cahier des charges IUT et au CDC projet.

- **Contexte & contraintes** : App web **front-end** en React/Vue + **Three.js**, API publique (data.gouv.nc), déploiement **Netlify**, repo **GitHub**, interactions fluides, responsive. Délai : **03/10/2025**. (refs : CDC IUT & CDC projet)
- **Cible MVP** : globe 3D + pins, sélection station + **barres 3D** par taxon pour l’année active, **timeline 2012–2024**, **sidebar** KPI + table + sparklines.

---

## A. Backlog initial (tickets Codex)

### Sprint 0 — Infrastructure (outillage)
1. **Init Vite + React + TS** (si non fait) ; installer `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`.
2. **Qualité** : ESLint + Prettier + Vitest + RTL ; Husky + lint-staged ; scripts npm (dev/build/test/lint/format).
3. **Netlify** : `netlify.toml` (SPA redirect), variables d’environnement (`.env.example`).

### Sprint 1 — Données & état
4. **Types & contrats** (TS) : `Station`, `StationSummary`, `TaxonSeries`, `Year`.
5. **Endpoints/Adapters** : `endpoints.ts` (API vs fallback JSON), `stations.adapter.ts`, `summary.adapter.ts`, `series.adapter.ts`.
6. **Store** (Zustand) : slices `station`, `year`, `filters`, `ui` + URL state (serialize/parse).

### Sprint 2 — Globe 3D
7. **Canvas** (R3F + drei) : scène, caméra, contrôles orbit, perf de base.
8. **Terre** (`Earth.tsx`) : sphère + textures ≤2K, lumière ambiante simple.
9. **Pins** (`StationPins.tsx`) : instancing, tooltip au survol, click = sélection + centrage caméra.
10. **Barres 3D** (`Bars3D.tsx`) : instancing par taxon, hauteur ∝ value (cap global), palette couleur stable, légende compacte.

### Sprint 3 — UI & interactions
11. **Topbar** (`Topbar.tsx`) : titre + `StationSearch` + `YearSlider` + `TimelineControls` (play/pause).
12. **Sidebar** (`StationPanel.tsx`) : fiche station + **KpiCards** + **TaxaTable** (tri) + **Sparklines**.
13. **Responsive** (`ResponsiveShell.tsx`) : desktop (sidebar fixe), tablette (drawer), mobile (bottom‑sheet).

### Sprint 4 — Résilience & polish
14. **Empty/error/loading** : skeletons, bannières, timeouts → fallback JSON.
15. **A11y** : focus, clavier, contraste, `prefers-reduced-motion`.
16. **Perf** : culling, instancing, minimiser re-renders, limiter ombres (aucune dynamique).

---

## B. Contrats de données (référence Codex)

### 1) Station (référentiel)
```ts
// types/models.ts
export type StationId = string
export interface Station {
  id: StationId
  nom: string
  site: string
  typeRecif: string
  lat: number
  lon: number
  profondeurMax?: number
  anneeDebut?: number
}
```

### 2) Années
```ts
export type Year = 2012 | 2013 | ... | 2024
export const YEARS: Year[] = [2012, 2013, /* … */ 2024]
```

### 3) Summary station+année
```ts
export interface StationSummary {
  stationId: StationId
  year: Year
  kpis: {
    total: number
    topTaxa: { code: string; label: string; value: number }[]
    deltaVsPrev?: number // en % ou valeur brute
  }
  bars: { code: string; label: string; value: number }[] // un item par taxon
}
```

### 4) Series temporelles par taxon
```ts
export interface TaxonSeriesPoint { year: Year; value: number | null }
export interface TaxonSeries {
  stationId: StationId
  code: string
  label: string
  points: TaxonSeriesPoint[] // 2012→2024 (trous = null)
}
```

> Remarques :
> - Les **codes taxon** (ex. BEN, AOU, DIA, AEM…) ont une palette **stable**.
> - Zéros affichés → barre atténuée ; `null` = “N.D.” (données manquantes).

---

## C. Spécifications API (pseudo)

- **Sources** : data.gouv.nc (datasets *rorc_localisations* et *rorc_invertebres*) ; fallback JSON local (`/public/data/*`).
- **Adresses** : centralisées dans `endpoints.ts` ; switch via `VITE_USE_FALLBACK`.
- **Requêtes** (côté API publique) :
  - *Stations* : sélectionner `id/nom/site/typeRecif/point_geo`.
  - *Summary (station, year)* : `sum(decompte) by code, description` avec filtre `station & campagne=year`.
  - *Series (station, taxon)* : `sum(decompte) by campagne` avec filtre `station & code`.
- **Adapters** : mappent la réponse API → **contrats** ci-dessus, complètent les trous de séries (2012→2024).

---

## D. UI & composants (inventaire + props)

- `GlobeCanvas` — crée le `<Canvas>` R3F, cam, contrôles orbit ; **props**: `children`.
- `Earth` — maillage sphère + textures ; **props**: `textureUrl`, `radius`.
- `StationPins` — instanced meshes ; **props**: `stations: Station[]`, `selectedId?`, `onHover(id)`, `onSelect(id)`.
- `Bars3D` — barres par taxon autour d’une station ; **props**: `summary: StationSummary`, `cap: number`, `palette: Record<string,string>`.
- `Legend` — palette codes taxon ; **props**: `palette`.
- `Topbar` — titre, `StationSearch`, `YearSlider`, `TimelineControls` ; **props**: none (lit store).
- `StationSearch` — auto-complétion ; **props**: `onSelect(id)`.
- `YearSlider` — slider 2012–2024 ; **props**: `year`, `onChange(Year)`.
- `TimelineControls` — play/pause ; **props**: `playing`, `onToggle()`.
- `StationPanel` — fiche + KPIs + table + sparklines ; **props**: `station: Station`, `summary: StationSummary`, `series: TaxonSeries[]`.
- `KpiCards`, `TaxaTable`, `Sparklines` — composants internes.
- `ResponsiveShell` — gère layout desktop/drawer/bottom‑sheet.

---

## E. Store (slices & actions)

```ts
// store/station.slice
state: { stationId: StationId | null }
actions: { setStation(id), clearStation() }

// store/year.slice
state: { year: Year, playing: boolean, speed: 1 | 2 }
actions: { setYear(y), play(), pause(), setSpeed(s) }

// store/filters.slice
state: { typeRecif?: string, site?: string }
actions: { setTypeRecif(v), setSite(v), clear() }

// store/ui.slice
state: { drawerOpen: boolean, bottomSheet: 'closed'|'half'|'full' }
actions: { setDrawerOpen(b), setBottomSheet(s) }
```

- **URL state** : `?stationId=…&year=…&typeRecif=…` — sérialiser/désérialiser via `@lib/urlState`.

---

## F. Règles d’affichage 3D & palette

- **Cap global** (ex. 100) pour normaliser les hauteurs ; exposer un réglage (devtools/Settings).
- **Palette taxon (exemple minimal)** : `{ BEN:'#2E86AB', AOU:'#C0392B', DIA:'#16A085', AEM:'#8E44AD' }`.
- **Perf** : instancing pins/barres, textures ≤2K, pas d’ombres dynamiques, frustum‑culling ; >30 FPS en lecture timeline.

---

## G. États de chargement/erreur (exigences)

- **Loading** : skeleton globe (pins gris), skeleton sidebar.
- **Timeout API** : message + switch auto sur **fallback JSON** si activé.
- **Data manquante** : marqueur “N.D.” + style atténué, pas de crash.

---

## H. Tests (acceptation par module)

- **Stations** : `useStations` renvoie ≥1 station avec lat/lon num.
- **Summary** : somme `bars[].value` ≥ `kpis.total` (tolérance selon taxons filtrés).
- **Globe** : click pin → `stationId` mis à jour + caméra recentrée.
- **Timeline** : slider + play/pause mettent à jour `year` et déclenchent refresh UI.
- **Sidebar** : table triable, KPIs cohérents, sparklines alignées sur l’année.
- **Responsive** : bottom‑sheet manipulable au touch (ouverture/fermeture).

---

## I. Prompts “prêts‑à‑coder” (exemples pour Codex)

**1) Créer les types & constants**
> Crée `src/types/models.ts` avec `Station`, `Year`, `StationSummary`, `TaxonSeries`. Exporte `YEARS=[2012..2024]`. Ajoute tests de type simples.

**2) Mettre en place le store**
> Implémente `store/*` (Zustand) avec slices décrits en section E. Expose des hooks `useStation()`, `useYear()`, etc. Ajoute tests unitaires de base.

**3) Scene 3D minimal viable**
> Ajoute `GlobeCanvas`, `Earth`, `StationPins` (mock stations) et active contrôles orbit. Aucune ombre dynamique. Texture Terre ≤2K.

**4) Summary & Bars3D**
> `Bars3D` reçoit un `StationSummary`, calcule hauteurs par `cap`. Instancing. Légende des couleurs.

**5) UI**
> `Topbar` + `StationSearch` (mock liste) + `YearSlider` (2012–2024) + `TimelineControls`. `StationPanel` en lecture seule.

---

## J. Liens & variables

- **ENV** : `VITE_API_BASE`, `VITE_USE_FALLBACK`.
- **Build** : `npm run build` → `dist/` ; Netlify (SPA redirect).
- **Repo** : GitHub public, branche `main`, PR par feature ; labels `area:*`, `type:*`.

---

### Notes finales
- Commencer par les **données** et le **store**, brancher ensuite la 3D et l’UI.
- Le MVP doit rester **sobre** et **fluide** ; la justesse des données prime sur l’effet visuel.

