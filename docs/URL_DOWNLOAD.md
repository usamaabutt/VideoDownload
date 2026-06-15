# VidFlow — Download Video from URL

This document describes the **Import** feature: paste a video link from YouTube, TikTok, Instagram, or Facebook and download it to the device gallery.

For the YouTube feed, search, and in-app player, see [IMPLEMENTATION.md](./IMPLEMENTATION.md).

---

## Table of contents

1. [Overview](#overview)
2. [Supported platforms](#supported-platforms)
3. [User flow](#user-flow)
4. [Architecture](#architecture)
5. [Project structure](#project-structure)
6. [Backend implementation](#backend-implementation)
7. [Mobile app implementation](#mobile-app-implementation)
8. [URL validation & normalization](#url-validation--normalization)
9. [End-to-end data flow](#end-to-end-data-flow)
10. [API reference](#api-reference)
11. [Gallery permissions](#gallery-permissions)
12. [Progress tracking](#progress-tracking)
13. [Setup & run](#setup--run)
14. [Troubleshooting](#troubleshooting)
15. [Limitations](#limitations)
16. [Security notes](#security-notes)

---

## Overview

The **Import** tab lets users paste any supported video URL and download it without browsing the feed.

| Capability | Details |
|------------|---------|
| **Input** | Paste field + Download button |
| **Platforms** | YouTube, TikTok, Instagram, Facebook |
| **Output** | MP4 saved to device gallery in the **VidFlow** album |
| **Progress** | Shown on the **Downloads** tab (%, MB, speed) |
| **Backend** | `vidflow-server` uses **yt-dlp** (`youtube-dl-exec`) to resolve and stream video |

This feature is separate from the YouTube feed download flow (`GET /api/youtube/download/:id`). Feed downloads use a YouTube video ID; Import downloads use a **full URL**.

---

## Supported platforms

| Platform | Example URL formats |
|----------|---------------------|
| **YouTube** | `https://www.youtube.com/watch?v=...`, `https://youtu.be/...` |
| **TikTok** | `https://www.tiktok.com/@user/video/...`, `https://vm.tiktok.com/...`, `https://vt.tiktok.com/...` |
| **Instagram** | `https://www.instagram.com/reel/...`, `https://www.instagram.com/p/...` |
| **Facebook** | `https://www.facebook.com/watch/?v=...`, `https://fb.watch/...` |

The app accepts:

- Full `https://` links
- Links without `https://` (auto-prefixed)
- Full share text from TikTok / other apps (URL is extracted automatically)
- Short links (`vm.tiktok.com`, `youtu.be`, `fb.watch`, etc.)

---

## User flow

```
1. Open Import tab
2. Paste video link (or full share message)
3. App validates URL in real time
4. Tap Download
5. App requests gallery permission (if needed)
6. Backend resolves video metadata (title, size, thumbnail) — may take 10–30s
7. App navigates to Downloads tab
8. Video streams from server → saved to Gallery → VidFlow album
9. Alert: "Download complete"
```

If the link is invalid, a red message appears under the input:

> Unsupported link — use a YouTube, TikTok, Instagram, or Facebook URL

---

## Architecture

```
┌─────────────────────┐                              ┌─────────────────────┐
│   Import Screen     │  POST /api/download/info     │   vidflow-server    │
│   (paste URL)       │  ─────────────────────────►  │                     │
│                     │  ◄─────────────────────────  │  urlValidation.js   │
│   downloadStore     │       { title, fileSize }    │  download.service   │
│   downloadService   │                              │  (yt-dlp)           │
│                     │  GET /api/download/stream    │                     │
│                     │  ─────────────────────────►  │  pipes MP4 stream   │
│                     │  ◄─────────────────────────  │                     │
│   react-native-     │       binary video           │                     │
│   blob-util         │                              │                     │
│   CameraRoll        │  save to Gallery/VidFlow     │                     │
└─────────────────────┘                              └─────────────────────┘
```

**Why yt-dlp on the server?**

- Social platforms block direct downloads from mobile apps
- yt-dlp handles URL resolution, format selection, and streaming for many sites
- The mobile app only receives a plain MP4 stream — no platform SDKs on device

---

## Project structure

### Mobile app (`VidFlow`)

| File | Role |
|------|------|
| `src/screens/Import/ImportScreen.js` | Paste field, validation UI, Download button |
| `src/screens/Import/index.js` | Screen export |
| `src/store/downloadStore.js` | `downloadFromUrl()` orchestration |
| `src/services/download/downloadService.js` | `fetchUrlDownloadInfo()`, stream download |
| `src/utils/videoUrl.js` | URL normalize, validate, platform detect |
| `src/utils/permissions.js` | Gallery permission (iOS + Android) |
| `src/navigation/MainTabNavigator.js` | Import tab registration |
| `src/config/routes.js` | `ROUTES.IMPORT` |
| `src/config/env.js` | `DOWNLOAD_INFO_TIMEOUT_MS`, `APP_GALLERY_ALBUM` |
| `__tests__/videoUrl.test.js` | URL validation unit tests |

### Backend (`vidflow-server`)

| File | Role |
|------|------|
| `src/routes/download.routes.js` | `/api/download/info`, `/api/download/stream` |
| `src/controllers/download.controller.js` | Request handlers |
| `src/services/download.service.js` | `getDownloadInfoFromUrl()`, `streamUrlDownload()` |
| `src/utils/urlValidation.js` | Server-side URL allowlist + normalize |
| `src/utils/platform.js` | Platform detection from hostname |
| `src/routes/index.js` | Mounts `/download` routes |

---

## Backend implementation

### Routes

Mounted at `/api/download`:

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/info` | Resolve metadata from URL |
| `GET` | `/stream?url=...` | Stream MP4 to client |

### Metadata (`POST /api/download/info`)

1. Validate and normalize URL (`urlValidation.js`)
2. Call yt-dlp with `dumpSingleJson: true`
3. Pick best MP4 format: `best[ext=mp4]/best`
4. Return normalized video object:

```json
{
  "id": "tiktok_7645582004599229703",
  "videoId": "tiktok_7645582004599229703",
  "title": "Video title",
  "thumbnail": "https://...",
  "channelTitle": "username",
  "platform": "tiktok",
  "sourceUrl": "https://www.tiktok.com/...",
  "fileSize": 4820000,
  "fileSizeMB": "4.60"
}
```

`id` is `{platform}_{videoId}` or a hash of the URL if yt-dlp does not return an ID.

### Stream (`GET /api/download/stream`)

1. Validate URL from query string
2. Resolve metadata for filename and optional `X-Video-Size` header
3. Pipe yt-dlp stdout directly to the HTTP response as `video/mp4`
4. Kill yt-dlp subprocess if the client disconnects

### URL allowlist (server)

Only these host patterns are accepted:

- `youtube.com`, `youtu.be`
- `tiktok.com` (includes `www`, `vm`, `vt`, `m`)
- `instagram.com`
- `facebook.com`, `fb.watch`

Invalid or unsupported URLs return **400** with a clear error message.

---

## Mobile app implementation

### Import screen

`ImportScreen.js` provides:

- Multiline text input for pasted links
- Real-time validation via `isSupportedVideoUrl()`
- Auto-clean on input via `normalizeVideoUrlInput()`
- Platform chips (YouTube, TikTok, Instagram, Facebook)
- Disabled Download button until URL is valid
- Loading spinner while metadata is fetched
- Navigation to **Downloads** tab when download starts

### Download store — `downloadFromUrl(url)`

```javascript
downloadFromUrl(url)
  → normalizeVideoUrlInput(url)
  → isSupportedVideoUrl(url)
  → fetchUrlDownloadInfo(url)          // POST /api/download/info
  → build video object with sourceUrl
  → downloadVideo(video)               // shared download pipeline
```

`downloadVideo()` is shared with feed downloads. For URL imports, the video object includes `sourceUrl`, which routes the stream to `/api/download/stream` instead of `/api/youtube/download/:id`.

### Download service

```javascript
// Metadata
fetchUrlDownloadInfo(sourceUrl)
  → POST /api/download/info  (60s timeout)

// Stream URL selection
video.sourceUrl
  → GET /api/download/stream?url=...
video.videoId only (feed)
  → GET /api/youtube/download/:id
```

Download uses `react-native-blob-util` to write to cache, then `CameraRoll.saveAsset()` to save into the **VidFlow** gallery album.

---

## URL validation & normalization

Implemented in `src/utils/videoUrl.js` (app) and `src/utils/urlValidation.js` (server).

### Normalization steps

1. Trim whitespace
2. Remove invisible Unicode characters (zero-width spaces, RTL marks)
3. Extract `https://...` URL from pasted share text
4. Add `https://` if user pasted `www.tiktok.com/...` without protocol
5. Strip trailing punctuation (`.`, `)`, etc.)

### Validation

Uses **regex-based hostname parsing** (not `new URL()`), because React Native’s URL parser can mis-handle TikTok links with `@username` in the path.

```javascript
// Example: accepted
https://www.tiktok.com/@zulfiali59/video/7645582004599229703?_r=1&_t=ZS-96uObr2EFhH

// Hostname extracted: tiktok.com → allowed
```

### Unit tests

Run URL validation tests:

```bash
cd VidFlow
yarn test __tests__/videoUrl.test.js --watchman=false
```

---

## End-to-end data flow

```
User pastes URL in Import tab
        │
        ▼
normalizeVideoUrlInput() + isSupportedVideoUrl()
        │
        ▼
User taps Download
        │
        ▼
requestGalleryPermission()  (iOS: read-write photos, Android: media storage)
        │
        ▼
POST /api/download/info { url }
        │
        ├── yt-dlp resolves title, thumbnail, file size
        └── Returns video metadata JSON
        │
        ▼
Navigate to Downloads tab
        │
        ▼
GET /api/download/stream?url=...
        │
        ├── react-native-blob-util writes to cache
        ├── Progress polled every 400ms + blob progress events
        └── CameraRoll.saveAsset() → Gallery / VidFlow
        │
        ▼
Download complete alert
```

---

## API reference

### `POST /api/download/info`

**Request body:**

```json
{
  "url": "https://www.tiktok.com/@user/video/1234567890"
}
```

**Success (200):** Video metadata object (see [Metadata](#metadata-post-apidownloadinfo)).

**Errors:**

| Status | Cause |
|--------|-------|
| `400` | Missing URL, invalid URL, unsupported platform |
| `500` | yt-dlp failed to resolve link |

### `GET /api/download/stream`

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Full video URL (URL-encoded) |

**Success (200):** `Content-Type: video/mp4` binary stream.

**Response headers:**

| Header | Description |
|--------|-------------|
| `Content-Disposition` | Suggested filename |
| `X-Video-Size` | File size in bytes (when known) |

---

## Gallery permissions

| Platform | Permission |
|----------|------------|
| **Android 13+** | `READ_MEDIA_VIDEO` |
| **Android ≤ 28** | `WRITE_EXTERNAL_STORAGE` |
| **Android 29–32** | No extra permission (scoped storage) |
| **iOS** | `iosRequestReadWriteGalleryPermission()` — required to save into named **VidFlow** album |

iOS `Info.plist` keys:

- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`

---

## Progress tracking

URL downloads use the same progress system as feed downloads:

| Metric | Source |
|--------|--------|
| **Downloaded MB** | Cache file size polling (400ms) |
| **Total size** | `/api/download/info` response |
| **Percent** | `received / total` |
| **Speed** | `downloadSpeed.js` tracker |

View progress on the **Downloads** tab under **In progress**.

---

## Setup & run

### Prerequisites

- `vidflow-server` running with **yt-dlp** available (`youtube-dl-exec` package)
- Mobile app connected to backend (see networking below)
- Gallery permissions granted on device

### Start server

```bash
cd vidflow-server
npm run restart
```

### Start app

```bash
cd VidFlow
yarn start          # Metro
yarn android        # or yarn ios
```

**Android physical device / emulator:**

```bash
yarn adb:reverse    # forwards localhost:3000
```

**iOS simulator:** `localhost:3000` works directly.

**Physical device on Wi‑Fi:** set `API_BASE_URL` in `src/config/env.js` to your Mac’s LAN IP.

---

## Troubleshooting

### "Unsupported link" for a valid TikTok URL

- Reload the app (**R** twice in Metro) after code updates
- Paste the full `https://` link, or paste the entire share message
- TikTok links with `@username` require regex validation (fixed in `videoUrl.js`)

### "Could not fetch video"

- Server may still be resolving the link — wait up to 60 seconds
- Check server terminal for yt-dlp errors
- Some Instagram / Facebook links require login — yt-dlp may fail
- Restart server: `cd vidflow-server && npm run restart`

### Download stuck at 0%

- Ensure `/api/download/info` returned `fileSize > 0`
- Check server is not an old process on port 3000
- See progress section in [IMPLEMENTATION.md](./IMPLEMENTATION.md) download notes

### iOS permission crash

- Use `iosRequestReadWriteGalleryPermission()` (not deprecated `CameraRoll.requestAddOnlyPhotosPermission`)
- Grant Photos access in Settings → VidFlow

### Network error on Android

```bash
adb reverse tcp:3000 tcp:3000
```

Ensure cleartext HTTP is allowed in `android/app/src/main/AndroidManifest.xml`.

### yt-dlp exit code non-zero

Common causes:

- Video is private, deleted, or region-locked
- Platform changed their page structure (update yt-dlp: `npm update youtube-dl-exec` in `vidflow-server`)
- Rate limiting — wait and retry

---

## Limitations

1. **No in-app playback** for TikTok / Instagram / Facebook imports — download only (YouTube feed still has the player)
2. **Platform reliability** — social sites change often; some links fail without cookies/login
3. **Format** — best available MP4 via yt-dlp; quality varies by platform
4. **Legal / ToS** — users should only download content they have rights to
5. **No playlist support** — `noPlaylist: true` in yt-dlp options
6. **History limit** — last 20 downloads stored in app state (not persisted across restarts)

---

## Security notes

1. **URL allowlist** — server only accepts known video platform hostnames (SSRF protection)
2. **No arbitrary URLs** — random websites cannot be passed to yt-dlp
3. **API key not required** for URL downloads — yt-dlp fetches metadata directly (YouTube API key still needed for feed/search)
4. **Production** — use HTTPS for `API_BASE_URL` and consider rate limiting `/api/download/*`
5. **Never expose server to public internet** without authentication if running yt-dlp

---

## Related docs

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — YouTube feed, search, player, and feed-based downloads
