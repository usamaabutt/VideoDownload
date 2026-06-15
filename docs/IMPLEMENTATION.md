# VidFlow — YouTube Implementation Guide

This document explains how the YouTube video fetching feature was built, what you need to run it, and how the mobile app and backend work together.

---

## Table of contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Architecture](#architecture)
4. [Project structure](#project-structure)
5. [Backend implementation](#backend-implementation)
6. [Mobile app implementation](#mobile-app-implementation)
7. [Data flow](#data-flow)
8. [Setup & run](#setup--run)
9. [Device-specific networking](#device-specific-networking)
10. [API reference](#api-reference)
11. [Troubleshooting](#troubleshooting)
12. [Security notes](#security-notes)
13. [Next steps](#next-steps)

---

## Overview

VidFlow is a React Native app that lets users:

- Browse **trending YouTube videos** on launch
- **Search** YouTube by keyword (with pagination)
- **Play videos** in-app using the YouTube iframe player
- **Share** video links

The mobile app does **not** call the YouTube API directly. Instead, it talks to a small **Express backend** (`vidflow-server`) that holds the YouTube API key and proxies requests to Google’s YouTube Data API v3.

This keeps the API key off the device and makes it easier to add more platforms later (TikTok, Instagram, etc.) by adding new backend routes.

---

## Requirements

### System requirements

| Requirement | Version / notes |
|-------------|-----------------|
| **Node.js** | ≥ 22.11.0 |
| **npm** or **yarn** | Latest stable |
| **React Native CLI** | Included via project devDependencies |
| **Xcode** (iOS) | For iOS simulator / device builds |
| **Android Studio** | For Android emulator / device builds |
| **Ruby + Bundler** (iOS) | For CocoaPods (`bundle install`, `pod install`) |
| **adb** (Android) | For physical device port forwarding |

### Accounts & API keys

| Item | Required | How to get it |
|------|----------|---------------|
| **Google Cloud account** | Yes | [console.cloud.google.com](https://console.cloud.google.com) |
| **YouTube Data API v3** | Yes | Enable in APIs & Services → Library |
| **API key** | Yes | Credentials → Create credentials → API key |

### Google Cloud setup (step by step)

1. Create a project (e.g. `VidFlow`)
2. Go to **APIs & Services → Library**
3. Search for **YouTube Data API v3** and click **Enable**
4. Go to **APIs & Services → Credentials**
5. Click **Create credentials → API key**
6. Copy the key into `vidflow-server/.env`:

   ```
   YOUTUBE_API_KEY=AIzaSy...your_key_here
   PORT=3000
   ```

7. For development, set API key restrictions to **Don’t restrict key**, or restrict to **YouTube Data API v3** only. Avoid IP/HTTP referrer restrictions until you deploy.

### npm dependencies

**Mobile app (`VidFlow`)**

| Package | Purpose |
|---------|---------|
| `axios` | HTTP client for backend API |
| `zustand` | Feed/search state management |
| `@react-navigation/native` + `stack` | Screen navigation |
| `react-native-screens` | Native screen containers |
| `react-native-gesture-handler` | Gesture support for navigation |
| `react-native-webview` | Required by YouTube player |
| `react-native-youtube-iframe` | In-app YouTube playback |
| `react-native-safe-area-context` | Safe area insets |

**Backend (`vidflow-server`)**

| Package | Purpose |
|---------|---------|
| `express` | HTTP server |
| `axios` | Calls YouTube Data API v3 |
| `cors` | Allows requests from the mobile app |
| `dotenv` | Loads `.env` for API key |

---

## Architecture

```
┌─────────────────────┐         HTTP (JSON)          ┌─────────────────────┐
│   React Native App  │  ─────────────────────────►  │   vidflow-server    │
│      (VidFlow)      │  ◄─────────────────────────  │     (Express)       │
└─────────────────────┘                              └──────────┬──────────┘
                                                                 │
                                                                 │ HTTPS + API key
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │  YouTube Data API   │
                                                      │        v3           │
                                                      └─────────────────────┘
```

**Why a backend?**

- API keys must not be embedded in the mobile app (they can be extracted from APK/IPA)
- Central place to normalize video data across platforms
- Rate limiting, caching, and multi-platform support can be added later

---

## Project structure

### Mobile app — `VidFlow/`

```
src/
├── app/
│   ├── App.js                 # Root component
│   └── providers/             # GestureHandlerRootView wrapper
├── components/
│   ├── common/                # SearchBar, LoadingState, ErrorBanner, etc.
│   └── video/                 # VideoCard, YouTubePlayer
├── config/
│   ├── env.js                 # API_BASE_URL, timeouts, page size
│   └── routes.js              # Navigation route names
├── hooks/
│   ├── useVideoFeed.js        # Feed screen logic (search, refresh, pagination)
│   └── useConnectivityCheck.js # Health check on app start
├── navigation/
│   └── AppNavigator.js        # Feed → Player stack
├── screens/
│   ├── Feed/                  # Trending + search list
│   └── Player/                # YouTube player + metadata
├── services/
│   ├── api/client.js          # Axios instance + interceptors
│   └── youtube/youtubeApi.js  # fetchTrending, searchVideos, fetchVideoById
├── store/
│   └── feedStore.js           # Zustand store (videos, loading, error, pagination)
├── theme/                     # colors, spacing, typography
└── utils/                     # format.js, logger.js, youtube.js
```

### Backend — `vidflow-server/` (sibling folder)

```
src/
├── app.js                     # Express bootstrap, listens on 0.0.0.0:3000
├── config/env.js              # Loads .env, exports port + API key
├── controllers/
│   └── youtube.controller.js  # HTTP handlers (thin layer)
├── middleware/
│   ├── errorHandler.js        # Formats YouTube API errors
│   └── requestLogger.js       # Request/response logging
├── routes/
│   ├── index.js               # Mounts /youtube under /api
│   └── youtube.routes.js      # Route definitions
├── services/
│   └── youtube.service.js     # YouTube API calls + data formatting
└── utils/
    └── duration.js            # ISO 8601 duration → "4:13"
```

---

## Backend implementation

### Endpoints

All YouTube routes are mounted at `/api/youtube`.

| Route | YouTube API used | Description |
|-------|------------------|-------------|
| `GET /api/youtube/trending` | `videos.list` (`chart=mostPopular`) | Trending videos by region |
| `GET /api/youtube/search` | `search.list` + `videos.list` | Search, then fetch full details |
| `GET /api/youtube/video/:id` | `videos.list` | Single video by ID |
| `GET /health` | — | Server + API key status |

### Video response shape

Every video is normalized to this JSON structure before sending to the app:

```json
{
  "id": "dQw4w9WgXcQ",
  "videoId": "dQw4w9WgXcQ",
  "title": "Video title",
  "description": "Full description...",
  "channelTitle": "Channel name",
  "channelId": "UC...",
  "publishedAt": "2024-01-15T12:00:00Z",
  "thumbnail": "https://i.ytimg.com/vi/.../hqdefault.jpg",
  "thumbnailHigh": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
  "viewCount": 1234567,
  "likeCount": 89000,
  "duration": "4:13",
  "durationRaw": "PT4M13S",
  "platform": "youtube"
}
```

### Search flow

Search requires two YouTube API calls:

1. **`search.list`** — find video IDs matching the query
2. **`videos.list`** — fetch statistics, duration, and full snippet for those IDs

This is necessary because `search.list` does not return view counts or duration.

### Error handling

YouTube errors are caught in `errorHandler.js` and returned as:

```json
{ "error": "API key not valid. Please pass a valid API key." }
```

---

## Mobile app implementation

### Layers

| Layer | Files | Responsibility |
|-------|-------|----------------|
| **UI** | `FeedScreen`, `PlayerScreen`, components | Render lists, search bar, player |
| **Hooks** | `useVideoFeed` | Wire UI events to store |
| **State** | `feedStore.js` (Zustand) | Videos, loading, errors, pagination |
| **Services** | `youtubeApi.js` | HTTP calls to backend |
| **API client** | `client.js` | Base URL, timeout, logging interceptors |

### Feed screen behavior

- On mount → `fetchTrending()`
- Search triggers after **3+ characters** (`SEARCH_MIN_CHARS`)
- Pull-to-refresh → re-fetch trending
- Scroll to bottom → `loadMore()` with `nextPageToken`
- Tap card → navigate to `Player` with video object

### Player screen

- Uses `react-native-youtube-iframe` (WebView-based)
- Play/pause toggle and share via `Share.share()`
- Video metadata (views, likes, duration, description) from the feed/search response

### Path aliases

Imports use Babel aliases (configured in `babel.config.js`):

```javascript
import { colors } from '@theme';
import VideoCard from '@components/video/VideoCard';
import { fetchTrendingVideos } from '@services/youtube';
```

---

## Data flow

### Trending videos

```
FeedScreen mount
  → useVideoFeed → feedStore.fetchTrending()
    → youtubeApi.fetchTrendingVideos()
      → GET /api/youtube/trending
        → youtube.service.getTrendingVideos()
          → YouTube API: videos.list (mostPopular)
        ← normalized videos[]
      ← { videos, nextPageToken }
    ← set state
  ← FlatList renders VideoCard for each video
```

### Search

```
User types "Harry" (3+ chars)
  → feedStore.search("Harry")
    → GET /api/youtube/search?q=Harry
      → search.list → videos.list
    ← { videos, nextPageToken }
  ← update list
```

### Playback

```
User taps VideoCard
  → navigation.navigate('Player', { video })
    → YouTubePlayer renders with video.videoId
```

---

## Setup & run

### 1. Clone / open the project

```
workspace/
├── VidFlow/          # mobile app
└── vidflow-server/   # backend (sibling folder)
```

### 2. Backend

```bash
cd vidflow-server
cp .env.example .env
# Edit .env and add your YOUTUBE_API_KEY

npm install
npm start
```

Expected output:

```
VidFlow server running on http://0.0.0.0:3000
[VidFlow Server] YouTube API key: configured ✓ (…A9SE)
```

Verify:

```bash
curl http://localhost:3000/health
# {"status":"ok","youtubeApiKey":"configured"}
```

If port 3000 is stuck on an old process:

```bash
npm run restart
```

### 3. Mobile app

```bash
cd VidFlow
npm install

# iOS only (first time or after native dep changes)
bundle install
cd ios && bundle exec pod install && cd ..

# Terminal 1 — Metro
npm start

# Terminal 2 — run app
npm run android   # includes adb reverse for port 3000
# or
npm run ios
```

---

## Device-specific networking

The app uses `http://localhost:3000` in development (`src/config/env.js`).

| Target | How it reaches the backend |
|--------|----------------------------|
| **iOS Simulator** | `localhost:3000` works directly |
| **Android Emulator** | Run `adb reverse tcp:3000 tcp:3000` (done automatically by `npm run android`) |
| **Physical Android device** | `adb reverse tcp:3000 tcp:3000` over USB, **or** set `API_BASE_URL` to your Mac’s LAN IP |
| **Physical iOS device** | Set `API_BASE_URL` to your Mac’s LAN IP (e.g. `http://192.168.1.5:3000`) |

Find your Mac’s IP:

```bash
ipconfig getifaddr en0
```

### Android HTTP (cleartext)

Development uses HTTP (not HTTPS). Android blocks this by default. The project includes:

- `android/app/src/main/res/xml/network_security_config.xml`
- `android:usesCleartextTraffic="true"` in `AndroidManifest.xml`

---

## API reference

### `GET /health`

**Response**

```json
{
  "status": "ok",
  "youtubeApiKey": "configured"
}
```

### `GET /api/youtube/trending`

| Query param | Default | Description |
|-------------|---------|-------------|
| `maxResults` | `20` | Number of videos |
| `regionCode` | `US` | ISO region code |

**Response**

```json
{
  "videos": [ /* Video[] */ ],
  "nextPageToken": "CAUQAA" | null
}
```

### `GET /api/youtube/search`

| Query param | Required | Description |
|-------------|----------|-------------|
| `q` | Yes | Search query |
| `maxResults` | No (default 20) | Results per page |
| `pageToken` | No | Pagination token from previous response |

### `GET /api/youtube/video/:id`

Returns a single normalized video object.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Network Error` / `ERR_NETWORK` | App can’t reach backend | Start server; run `adb reverse tcp:3000 tcp:3000` on Android |
| Health shows `{status:'ok'}` only, no `youtubeApiKey` | Old server still on port 3000 | `cd vidflow-server && npm run restart` |
| `API key not valid` | Bad/missing key, or API not enabled | Set key in `.env`, enable YouTube Data API v3, **restart server** |
| Server says `configured` but app still fails | Stale process on port 3000 | `npm run restart` in vidflow-server |
| Videos load on Mac curl but not on phone | Wrong `API_BASE_URL` or no port forward | Use `adb reverse` or LAN IP |
| `npm start` exits immediately | Port 3000 already in use | Kill old process: `npm run restart` |

### Debugging

Logs are written to the **Metro terminal** with the `[VidFlow]` prefix. Check:

- `[VidFlow] [Health]` — connectivity + API key status on server
- `[VidFlow] [API →]` / `[API ←]` — request/response details
- `[VidFlow Server]` — backend request logs

---

## Security notes

1. **Never commit `.env`** — it is listed in `vidflow-server/.gitignore`
2. **Never put the YouTube API key in the mobile app** — always proxy through the backend
3. **Regenerate API keys** if they are exposed in chat, screenshots, or public repos
4. **Restrict API keys in production** — limit to YouTube Data API v3 and your server’s IP
5. **Use HTTPS in production** — deploy the backend with TLS and update `API_BASE_URL`

---

## Next steps

To extend VidFlow beyond YouTube:

1. Add a new service in `vidflow-server/src/services/` (e.g. `tiktok.service.js`)
2. Add routes under `vidflow-server/src/routes/`
3. Add a matching client in `VidFlow/src/services/`
4. Extend `VideoCard` with platform badges
5. Add platform-specific players in `src/components/video/`

The feed store and UI are already structured to support multiple platforms with a shared video shape (`id`, `title`, `thumbnail`, `platform`, etc.).
