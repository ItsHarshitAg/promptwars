# SmartStadium

> Live crowd intelligence for large-scale sporting venues — built as a React TypeScript PWA.

**Live Demo → https://smartstadium-1071752532433.asia-south1.run.app/**

---

## Screenshots

| Dashboard | Navigation | AI Concierge | Login |
|-----------|------------|--------------|-------|
| Stat cards, live heatmap, smart recommendations | Split-panel map + zone sidebar | Gemini-powered chat with suggested questions | Google Sign-In card |

---

## Features

| Feature | Detail |
|---------|--------|
| **Live crowd heatmap** | Firebase Realtime DB seeded every 2 min — zone cards show density, status pill, progress bar |
| **Historical sparklines** | Each zone card shows a mini trend line from the last 10 snapshots so you can see crowds rising or falling |
| **Summary stat cards** | Busiest zone, active alerts count, best restroom, avg wait time — computed live from zone data |
| **Smart alert strips** | Per-zone alerts with contextual action suggestions ("Try Food South →") for zones over 80% |
| **Smart recommendations** | AI-driven text rows for lowest-queue food, restroom, and gate — with "Navigate there →" links |
| **Interactive map** | Google Maps JS API with coloured zone markers, InfoWindows, stadium floor plan SVG overlay, and route polylines |
| **Zone navigation sidebar** | 320px sidebar on /map — zone list, destination selector, crowd legend, selected zone status bar |
| **AI concierge** | Chat with StadiumAI (Gemini `gemini-2.5-flash-lite`) — suggested questions, typing indicator, timestamps |
| **Auth + route guard** | Firebase Google Sign-In — all routes are protected, unauthenticated users are redirected to /login |
| **Dark / light mode** | `prefers-color-scheme` respected by default + manual toggle persisted to `localStorage` |
| **PWA** | Installable, service worker via `vite-plugin-pwa` |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite |
| Routing | React Router v7 |
| Styling | CSS custom properties (dark/light tokens), inline styles |
| Maps | Google Maps JavaScript API (`@react-google-maps/api`) |
| AI | Google Gemini API (`@google/genai` SDK, `gemini-2.5-flash-lite`) |
| Backend | Express.js — Gemini proxy + static file server |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication (Google provider) |
| Testing | Vitest + React Testing Library (20 tests) |
| CI/CD | Google Cloud Build (`cloudbuild.yaml`) → Cloud Run |
| Container | Docker multi-stage, `node:22-alpine`, non-root user |

---

## Project Structure

```
src/
  components/     HeatmapZone, AlertPanel, ConciergeChat, MapView, Sparkline
  hooks/          useZoneData, useAlerts, useCrowd, useZoneHistory, useTheme, useAuth
  screens/        LoginScreen, HomeScreen, NavigationScreen, ConciergeScreen
  utils/          queuePredictor, alertTrigger, sanitiseInput, concierge
  types/          Zone, Alert, Message, User interfaces
  tests/          20 Vitest test suites
firebase/
  seed.ts         Simulated live zone data seeder (runs every 2 min)
server.js         Express server — Gemini API proxy + serves Vite build
cloudbuild.yaml   GCP Cloud Build → Cloud Run deployment pipeline
Dockerfile        Multi-stage hardened image
```

---

## Local Development

### 1. Prerequisites

Node.js 18+ and npm

### 2. Install

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_GOOGLE_MAPS_KEY=
VITE_GEMINI_API_KEY=
```

### 4. Seed Firebase with live data

```bash
npx tsx firebase/seed.ts
```

This writes 8 zone records to `/zones` and appends a snapshot to `/history/{zoneId}` every 2 minutes.

### 5. Start dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`. The Express server (for Gemini proxy) starts separately:

```bash
node server.js
```

### 6. Run tests

```bash
npm test
```

| Test file | Type | Cases |
|-----------|------|-------|
| `queuePredictor.test.ts` | Unit | 5 |
| `alertTrigger.test.ts` | Unit | 5 |
| `sanitiseInput.test.ts` | Unit | 5 |
| `LoginScreen.test.tsx` | Component | 2 |
| `AlertPanel.test.tsx` | Component | 3 |
| **Total** | | **20** |

---

## Deployment (Google Cloud Run)

### One-command deploy

```bash
gcloud builds submit --config=cloudbuild.yaml --project=promptwart \
  --substitutions=\
"_VITE_FIREBASE_API_KEY=...,\
_VITE_FIREBASE_AUTH_DOMAIN=...,\
_VITE_FIREBASE_DATABASE_URL=...,\
_VITE_FIREBASE_PROJECT_ID=...,\
_VITE_FIREBASE_STORAGE_BUCKET=...,\
_VITE_FIREBASE_MESSAGING_SENDER_ID=...,\
_VITE_FIREBASE_APP_ID=...,\
_VITE_FIREBASE_MEASUREMENT_ID=...,\
_VITE_GOOGLE_MAPS_KEY=...,\
_VITE_GEMINI_API_KEY=..."
```

### How it works

1. `cloudbuild.yaml` passes Firebase/Maps keys as Docker `--build-arg` — Vite bakes them into the bundle at build time
2. The Gemini API key is **only** set as a Cloud Run runtime environment variable — it never enters the JS bundle
3. The built image is pushed to GCR and deployed to Cloud Run in `asia-south1`

### Post-deploy step

Add the Cloud Run URL to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## Docker hardening

- Base image: `node:22-alpine` with `apk upgrade --no-cache` for OS CVE patches
- `--ignore-scripts` on `npm ci` to prevent supply-chain attacks
- Multi-stage build — dev dependencies and source never reach the final image
- Non-root `appuser` at runtime
- `npm cache clean --force` to reduce layer size

---

## Security notes

- All `VITE_*` keys loaded via `import.meta.env` — never hardcoded
- Gemini calls proxied through Express — API key stays server-side only
- User input is HTML-stripped and capped at 500 chars before reaching the AI
- Firebase Security Rules enforce authenticated read-only access
- `DOMPurify` sanitises all AI responses before rendering

