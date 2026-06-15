# VidFlow

A React Native app for discovering YouTube videos, downloading from multiple platforms, and saving to your gallery — backed by a lightweight Express API (`vidflow-server`).

## Features

- **Feed** — trending YouTube videos with search and pagination
- **Player** — in-app YouTube playback
- **Import** — paste a YouTube, TikTok, Instagram, or Facebook link to download
- **Downloads** — progress tracking; videos save to Gallery → **VidFlow** album

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | YouTube feed, search, player, feed downloads, setup |
| [docs/URL_DOWNLOAD.md](docs/URL_DOWNLOAD.md) | Import tab — download from pasted URLs |

## Project structure

```
VidFlow/                          # React Native mobile app
├── App.js                        # Root entry (re-exports src/app/App)
├── index.js                      # App registry
├── src/
│   ├── app/                      # Application shell
│   ├── components/               # UI components (common, video, download)
│   ├── config/                   # Environment & route constants
│   ├── hooks/                    # Custom React hooks
│   ├── navigation/               # React Navigation (tabs + stack)
│   ├── screens/                  # Feed, Import, Downloads, Player
│   ├── services/                 # API client, YouTube, download
│   ├── store/                    # Zustand state (feed, downloads)
│   ├── theme/                    # Design tokens
│   └── utils/                    # Helpers (permissions, URL validation, …)
├── android/
├── ios/
└── docs/

vidflow-server/                   # Backend API (sibling folder, separate repo)
```

## Path aliases

| Alias | Maps to |
|-------|---------|
| `@app` | `src/app` |
| `@components` | `src/components` |
| `@config` | `src/config` |
| `@hooks` | `src/hooks` |
| `@navigation` | `src/navigation` |
| `@screens` | `src/screens` |
| `@services` | `src/services` |
| `@store` | `src/store` |
| `@theme` | `src/theme` |
| `@utils` | `src/utils` |

## Getting started

### 1. Backend

```bash
cd ../vidflow-server
cp .env.example .env   # add your YouTube API key
npm install
npm run restart
```

### 2. Mobile app

Development uses `http://localhost:3000` in `src/config/env.js`.

- **iOS Simulator** — works out of the box
- **Android (emulator or device)** — `adb reverse tcp:3000 tcp:3000` (included in `npm run android`)
- **Physical device on Wi‑Fi** — set `API_BASE_URL` to your Mac's LAN IP

```bash
cd VidFlow
npm install
cd ios && bundle exec pod install && cd ..
npm start
npm run ios    # or npm run android
```

See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for full setup and troubleshooting.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/youtube/trending` | Trending videos |
| GET | `/api/youtube/search?q=` | Search videos |
| GET | `/api/youtube/video/:id` | Single video details |
| GET | `/api/youtube/download/:id/info` | YouTube download metadata |
| GET | `/api/youtube/download/:id` | YouTube download stream |
| POST | `/api/download/info` | URL download metadata |
| GET | `/api/download/stream?url=` | URL download stream |
