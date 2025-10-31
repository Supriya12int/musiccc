---
config:
  layout: dagre
---
flowchart TD
 subgraph Frontend["Frontend"]
        F1["Login/Register"]
        F2["Dashboard"]
        F3["ArtistDashboard"]
        F4["Upload Music"]
        F5["MusicPlayer"]
        F6["Podcasts"]
        F7["KaraokeLibrary"]
        F8["Profile/Settings"]
        F9["Notifications"]
        F10["ArtistLogin"]
        F11["ArtistProfile"]
        F12["BrowseArtists"]
  end
 subgraph Backend["Backend"]
        B1["Auth Middleware"]
        B2["User API"]
        B3["Music API"]
        B4["Podcast API"]
        B5["Karaoke API"]
        B6["Playlist API"]
        B7["Event API"]
        B8["Storage Service"]
        B9["Lyrics/Spotify Service"]
        B10["Artist API"]
  end
 subgraph Database["Database"]
        D1["Users"]
        D2["Songs"]
        D3["Playlists"]
        D4["Podcasts"]
        D5["Recordings"]
        D6["Events"]
        D7["ArtistFollowers"]
  end
 subgraph Storage["Storage"]
        S1["Audio Files"]
        S2["Cover Images"]
        S3["Karaoke Recordings"]
  end
    Frontend -- REST API Calls --> Backend
    Backend -- CRUD Operations --> Database
    Backend -- File Upload/Serve --> Storage
    F3 -- Artist Data/Stats --> B3
    F4 -- Upload Song --> B3
    F7 -- Karaoke Features --> B5
    F6 -- Podcast Access --> B4
    F9 -- Event Updates --> B7
    F10 -- Artist Authentication --> B1
    F11 -- Artist Profile Management --> B2
    F12 -- Artist Discovery --> B10
    F3 -- Follower Management --> B10
    B10 -- Follower Data --> D7