# 🎤 Karaoke Feature Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────┐    ┌────────────┐    ┌──────────────┐            │
│  │  Dashboard │───▶│  SongCard  │───▶│ Karaoke Mode │            │
│  │            │    │  (⋯ Menu)  │    │              │            │
│  └────────────┘    └────────────┘    └──────┬───────┘            │
│                                              │                     │
│  ┌────────────┐                              │                     │
│  │  Sidebar   │◀─────────────────────────────┘                     │
│  │ ┌────────┐ │                                                    │
│  │ │Karaoke │ │                                                    │
│  │ │Library │ │──────┐                                             │
│  │ └────────┘ │      │                                             │
│  └────────────┘      │                                             │
│                      ▼                                             │
│           ┌──────────────────┐                                     │
│           │ KaraokeLibrary   │                                     │
│           │ ┌──────────────┐ │                                     │
│           │ │My Recordings │ │                                     │
│           │ │  Community   │ │                                     │
│           │ └──────────────┘ │                                     │
│           └──────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API ROUTES                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GET  /api/karaoke/lyrics/:songId          ──▶ Fetch Lyrics       │
│  POST /api/karaoke/recordings              ──▶ Upload Recording    │
│  GET  /api/karaoke/my-recordings          ──▶ Get User Recordings │
│  GET  /api/karaoke/recordings/public      ──▶ Get Community       │
│  POST /api/karaoke/recordings/:id/like    ──▶ Like Recording      │
│  POST /api/karaoke/recordings/:id/play    ──▶ Increment Plays     │
│  DELETE /api/karaoke/recordings/:id       ──▶ Delete Recording    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Database Operations
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA MODELS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐         ┌──────────────┐                        │
│  │   Recording  │◀────────│     Song     │                        │
│  │              │         │              │                        │
│  │ - title      │         │ - title      │                        │
│  │ - audioUrl   │         │ - artist     │                        │
│  │ - duration   │         │ - lyrics ◀───┼────────────┐           │
│  │ - likes      │         │ - albumImage │            │           │
│  │ - playCount  │         └──────────────┘            │           │
│  │ - isPublic   │                                     │           │
│  └──────┬───────┘                                     │           │
│         │                                             │           │
│         │         ┌──────────────┐                    │           │
│         └────────▶│     User     │                    │           │
│                   │              │                    │           │
│                   │ - username   │                    │           │
│                   │ - email      │                    │           │
│                   └──────────────┘                    │           │
│                                                       │           │
└───────────────────────────────────────────────────────┼───────────┘
                                                        │
                                                        │
┌───────────────────────────────────────────────────────┼───────────┐
│                     FILE STORAGE                      │           │
├───────────────────────────────────────────────────────┼───────────┤
│                                                       │           │
│  frontend/public/recordings/                         │           │
│  ├── recording-1234567890-abc.webm ◀─────────────────┘           │
│  ├── recording-1234567891-def.webm                               │
│  └── recording-1234567892-ghi.webm                               │
│                                                                   │
│  Multer Configuration:                                           │
│  - Max Size: 50MB                                                │
│  - Format: audio/webm, audio/wav, audio/mp3                     │
│  - Auto cleanup on delete                                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     USER FLOW: RECORDING                            │
└─────────────────────────────────────────────────────────────────────┘

    User                    Frontend                  Backend
      │                        │                         │
      │ 1. Click Song Menu     │                         │
      ├───────────────────────▶│                         │
      │                        │                         │
      │ 2. Select Karaoke Mode │                         │
      ├───────────────────────▶│                         │
      │                        │                         │
      │                        │ 3. GET /lyrics/:songId  │
      │                        ├────────────────────────▶│
      │                        │                         │
      │                        │ 4. Return lyrics + info │
      │                        │◀────────────────────────┤
      │                        │                         │
      │ 5. Display Karaoke UI  │                         │
      │◀───────────────────────┤                         │
      │                        │                         │
      │ 6. Click Start Rec     │                         │
      ├───────────────────────▶│                         │
      │                        │                         │
      │ 7. Request Microphone  │                         │
      │◀───────────────────────┤                         │
      │                        │                         │
      │ 8. Grant Permission    │                         │
      ├───────────────────────▶│                         │
      │                        │                         │
      │ 9. Start MediaRecorder │                         │
      │   (Recording...)       │                         │
      │                        │                         │
      │ 10. Click Stop         │                         │
      ├───────────────────────▶│                         │
      │                        │                         │
      │ 11. Stop & Create Blob │                         │
      │                        │                         │
      │ 12. Click Save         │                         │
      ├───────────────────────▶│                         │
      │                        │                         │
      │                        │ 13. POST /recordings    │
      │                        │     (FormData + Audio)  │
      │                        ├────────────────────────▶│
      │                        │                         │
      │                        │                         │ 14. Save File
      │                        │                         │ 15. Create DB Record
      │                        │                         │
      │                        │ 16. Return recording    │
      │                        │◀────────────────────────┤
      │                        │                         │
      │ 17. Show success       │                         │
      │◀───────────────────────┤                         │
      │                        │                         │


┌─────────────────────────────────────────────────────────────────────┐
│                 COMPONENT HIERARCHY                                 │
└─────────────────────────────────────────────────────────────────────┘

App
└── Dashboard
    ├── Sidebar
    │   └── "Karaoke Library" MenuItem ───┐
    │                                      │
    ├── TopBar                             │
    │                                      │
    ├── Main Content                       │
    │   ├── SongCard (multiple)            │
    │   │   └── ⋯ Menu                     │
    │   │       └── "Karaoke Mode" ────┐   │
    │   │                               │   │
    │   └── KaraokeLibrary ◀────────────┼───┘
    │       ├── My Recordings Tab       │
    │       └── Community Tab           │
    │                                   │
    ├── MusicPlayer                     │
    │                                   │
    └── KaraokeMode (Modal) ◀───────────┘
        ├── Header (Song Info + Close)
        ├── Lyrics Panel (Left)
        └── Recording Studio (Right)
            ├── Status Indicator
            ├── Timer
            ├── Record Button
            ├── Pause/Resume Button
            ├── Stop Button
            ├── Playback Controls
            ├── Save Button
            └── Download Button


┌─────────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                                 │
└─────────────────────────────────────────────────────────────────────┘

KaraokeMode Component State:
├── lyrics: String
├── loading: Boolean
├── isRecording: Boolean
├── isPaused: Boolean
├── recordedBlob: Blob
├── recordedUrl: String
├── isPlaying: Boolean
├── isMuted: Boolean
├── recordingTime: Number
└── uploading: Boolean

KaraokeLibrary Component State:
├── activeTab: 'my-recordings' | 'community'
├── myRecordings: Array<Recording>
├── publicRecordings: Array<Recording>
├── loading: Boolean
└── playingId: String

Dashboard State (Karaoke):
├── karaokeMode: Boolean
└── selectedKaraokeSong: Song


┌─────────────────────────────────────────────────────────────────────┐
│                    BROWSER APIS USED                                │
└─────────────────────────────────────────────────────────────────────┘

1. MediaRecorder API
   └── Records audio from microphone
   └── Outputs WebM blob
   └── Events: ondataavailable, onstop

2. getUserMedia API
   └── Requests microphone permission
   └── Returns MediaStream
   └── Requires HTTPS

3. Audio Element
   └── Plays back recordings
   └── Controls: play, pause, volume
   └── Events: ended, timeupdate

4. URL.createObjectURL
   └── Creates blob URLs for playback
   └── Must be revoked to prevent memory leaks

5. FormData API
   └── Packages audio file for upload
   └── Handles multipart/form-data encoding
