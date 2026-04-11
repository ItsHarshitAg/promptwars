# SmartStadium

A React TypeScript Progressive Web App designed to improve the physical event experience for attendees at large-scale sporting venues.

## Features

- **Real-Time Crowd Heatmap**: Monitor live zone densities powered by Firebase Realtime Database.
- **Smart Alerts**: Automatic notifications when any zone exceeds 80% capacity.
- **AI Concierge**: Chat with StadiumAI (powered by Google Gemini `gemini-2.0-flash`) for food, restroom, and navigation recommendations based on live crowd data.
- **Interactive Map**: Zone markers with colour-coded density, powered by Google Maps JavaScript API.
- **Authentication**: Firebase Authentication with Google Sign-In.
- **PWA**: Installable, offline-ready via `vite-plugin-pwa`.

## Tech Stack

- React 18 + TypeScript (Vite)
- Firebase: Auth, Realtime Database, Cloud Messaging, Hosting
- Google Maps JavaScript API
- Google Gemini API (`@google/genai` SDK)
- Vitest + React Testing Library
- ESLint

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Seed Firebase Realtime Database

Simulate live crowd data with the seed script (updates every 10 s):

```bash
npx tsx firebase/seed.ts
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Run Tests

```bash
npm test
```

Tests include:

| File | Type | Cases |
|------|------|-------|
| `queuePredictor.test.ts` | Unit | 5 (empty, low, medium, high, over-capacity) |
| `alertTrigger.test.ts` | Unit | 5 (empty, below, exact, above, full) |
| `sanitiseInput.test.ts` | Unit | 5 (HTML strip, length limit, empty, plain text, nested HTML) |
| `LoginScreen.test.tsx` | Component | 2 (button render, description text) |
| `AlertPanel.test.tsx` | Component | 3 (single alert, multiple, dismiss buttons) |
| **Total** | | **20** |

## Production Deployment (Cloud Run)

1. Ensure your Google Cloud CLI is configured.
2. Build the server image (uses the `Dockerfile`).

```bash
gcloud run deploy smartstadium --source . --port 8080 --allow-unauthenticated --region asia-south1
```

### Docker Hardening

- Base image: `node:22-alpine` with `apk upgrade` to patch OS-level CVEs
- Non-root user (`appuser`) at runtime
- `--ignore-scripts` on npm install to prevent supply-chain attacks
- `npm cache clean --force` to reduce image size
- Multi-stage build — no devDependencies or source code in the final image

## Architecture

```
src/
  components/   — Presentational components (HeatmapZone, AlertPanel, ConciergeChat, MapView)
  hooks/        — Custom React hooks (useZoneData, useAlerts, useCrowd)
  screens/      — Page-level components (Login, Home, Navigation, Concierge)
  utils/        — Pure functions (queuePredictor, alertTrigger, sanitiseInput, concierge)
  types/        — Shared TypeScript interfaces
  tests/        — Vitest test suites
firebase/
  seed.ts       — Database seeder with simulated live updates
  functions/    — Cloud Function stub for Gemini API proxy
server.js       — Express production server (Gemini proxy + static files)
```

## Security

- All API keys are loaded from `.env` via `import.meta.env` — never hardcoded.
- Gemini API calls are proxied through server middleware — the API key never reaches the browser.
- User input is sanitised (HTML stripped, 500 char limit) before sending to the AI concierge.
- Firebase Security Rules enforce read-only access for authenticated users.
- Docker image runs as non-root user, uses `node:22-alpine` with OS patches applied, and `--ignore-scripts` to mitigate supply-chain attacks.
