# Karaoke / Singalong Mode Feature Documentation

## Overview
The Karaoke/Singalong Mode is an interactive feature that allows users to:
- View synchronized lyrics while songs play
- Record themselves singing along to their favorite tracks
- Save, playback, and download their recordings
- Share their karaoke performances with the community
- Browse and listen to other users' karaoke recordings

## Features Implemented

### 1. **Karaoke Mode Interface** 
Full-screen immersive karaoke experience with:
- **Lyrics Display**: Large, easy-to-read lyrics panel with smooth scrolling
- **Album Art**: Visual representation of the song being performed
- **Recording Studio**: Side panel with professional recording controls
- **Gradient Theme**: Beautiful purple/pink gradient backgrounds for ambiance

### 2. **Audio Recording**
Professional-grade recording capabilities:
- **WebRTC Audio Capture**: Browser-based microphone access
- **Recording Controls**: Start, pause, resume, and stop recording
- **Real-time Timer**: Live recording duration counter
- **Status Indicators**: Visual feedback (red pulse while recording, yellow when paused)
- **Format Support**: WebM audio format with up to 50MB file size

### 3. **Recording Management**
Complete recording lifecycle management:
- **Playback**: Listen to your recording before saving
- **Save to Library**: Upload to server with metadata
- **Download**: Export recordings to local device
- **Delete**: Remove unwanted recordings
- **Privacy Control**: Choose public or private recordings

### 4. **Karaoke Library**
Dedicated library with two sections:
- **My Recordings**: Personal collection with full management
- **Community**: Discover recordings from other users
- **Like System**: Heart/like recordings you enjoy
- **Play Counts**: Track how many times recordings are played
- **User Attribution**: See who created each karaoke cover

### 5. **Integration Points**
Seamlessly integrated into the main app:
- **SongCard Menu**: "Karaoke Mode" button in every song's dropdown menu
- **Sidebar Navigation**: Quick access via "Karaoke Library" menu item
- **Dashboard Integration**: Embedded throughout the music browsing experience

## Technical Architecture

### Backend Components

#### 1. **Recording Model** (`backend/models/Recording.js`)
```javascript
{
  title: String,
  song: ObjectId (ref: 'Song'),
  user: ObjectId (ref: 'User'),
  audioUrl: String,
  duration: Number,
  isPublic: Boolean,
  likes: [ObjectId],
  playCount: Number,
  comments: [{ user, text, createdAt }]
}
```

#### 2. **Karaoke Routes** (`backend/routes/karaoke.js`)
- `GET /api/karaoke/lyrics/:songId` - Fetch song lyrics
- `POST /api/karaoke/recordings` - Upload new recording (with file upload)
- `GET /api/karaoke/my-recordings` - Get user's recordings
- `GET /api/karaoke/recordings/public` - Get community recordings
- `GET /api/karaoke/recordings/song/:songId` - Get recordings for specific song
- `POST /api/karaoke/recordings/:id/like` - Like/unlike recording
- `POST /api/karaoke/recordings/:id/play` - Increment play count
- `DELETE /api/karaoke/recordings/:id` - Delete recording

#### 3. **File Storage**
- **Location**: `frontend/public/recordings/`
- **Naming**: `recording-{timestamp}-{random}.webm`
- **Multer Configuration**: 50MB limit, audio file validation
- **Cleanup**: Files deleted when recordings are removed

### Frontend Components

#### 1. **KaraokeMode Component** (`frontend/src/components/KaraokeMode.js`)
Full-screen modal component featuring:
- **Lyrics Panel**: Left side with scrollable lyrics
- **Recording Studio**: Right side with controls
- **State Management**: 
  - `isRecording`, `isPaused`, `recordedBlob`, `recordedUrl`
  - `recordingTime`, `uploading`, `lyrics`
- **MediaRecorder API**: Native browser recording
- **Audio Playback**: Preview recorded audio before saving

#### 2. **KaraokeLibrary Component** (`frontend/src/pages/KaraokeLibrary.js`)
Library page with:
- **Tab System**: My Recordings vs Community
- **Grid Layout**: Responsive card grid for recordings
- **Audio Player**: Inline playback with single shared audio element
- **Action Buttons**: Like, download, delete
- **Stats Display**: Play counts, likes, recording duration

#### 3. **SongCard Integration** (`frontend/src/components/SongCard.js`)
- **New Prop**: `onKaraoke` callback function
- **Menu Item**: "Karaoke Mode" with microphone icon
- **Pink Theme**: Distinguishes karaoke from other actions

#### 4. **Dashboard Integration** (`frontend/src/pages/Dashboard.js`)
- **State Management**: `karaokeMode`, `selectedKaraokeSong`
- **Event Handlers**: `handleKaraokeOpen`, `handleKaraokeClose`
- **Conditional Render**: Show KaraokeMode when active

#### 5. **Sidebar Updates** (`frontend/src/components/Sidebar.js`)
- **New Menu Item**: "Karaoke Library" with microphone icon
- **Navigation**: Links to karaoke-library tab

## User Flow

### Recording a Karaoke Session
1. User browses songs in Dashboard
2. Clicks three-dot menu on desired song
3. Selects "Karaoke Mode" 
4. Full-screen karaoke interface opens with lyrics
5. User clicks "Start Recording" button
6. Browser requests microphone permission
7. User sings along while lyrics are displayed
8. User can pause/resume recording as needed
9. User clicks "Stop Recording" when finished
10. Recording is instantly available for playback
11. User can:
    - **Play**: Preview the recording
    - **Save**: Upload to server and library
    - **Download**: Export to device
    - **Record Again**: Discard and start over

### Viewing Karaoke Library
1. User clicks "Karaoke Library" in sidebar
2. Sees two tabs: My Recordings and Community
3. My Recordings shows personal collection with:
   - Song cover art and title
   - Original song information
   - Recording date and duration
   - Play count and likes
   - Delete button
4. Community shows public recordings from all users with:
   - Username attribution
   - Like button
   - Download button
   - Play count

### Listening to Recordings
1. User hovers over recording card
2. Play button appears as overlay
3. Click to play recording
4. Audio plays from server URL
5. Play count increments automatically
6. Can like recording with heart button

## API Endpoints

### Lyrics Retrieval
```
GET /api/karaoke/lyrics/:songId
Authorization: Bearer <token>
Response: { lyrics: String, song: { title, artist, albumImageUrl } }
```

### Upload Recording
```
POST /api/karaoke/recordings
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: {
  audio: File,
  songId: String,
  title: String,
  duration: Number,
  isPublic: String ('true'/'false')
}
Response: { message: String, recording: Object }
```

### Get User Recordings
```
GET /api/karaoke/my-recordings
Authorization: Bearer <token>
Response: [Recording]
```

### Get Public Recordings
```
GET /api/karaoke/recordings/public
Authorization: Bearer <token>
Response: [Recording] (limit 50)
```

### Like Recording
```
POST /api/karaoke/recordings/:id/like
Authorization: Bearer <token>
Response: { likes: Number, isLiked: Boolean }
```

### Delete Recording
```
DELETE /api/karaoke/recordings/:id
Authorization: Bearer <token>
Response: { message: String }
```

## File Structure

```
backend/
├── models/
│   └── Recording.js          # Recording data model
├── routes/
│   └── karaoke.js           # Karaoke API endpoints
└── server.js                # Updated with karaoke routes

frontend/
├── public/
│   └── recordings/          # Uploaded audio files storage
├── src/
│   ├── components/
│   │   ├── KaraokeMode.js   # Full-screen karaoke interface
│   │   ├── SongCard.js      # Updated with karaoke button
│   │   └── Sidebar.js       # Updated with library link
│   └── pages/
│       ├── Dashboard.js     # Updated with karaoke integration
│       └── KaraokeLibrary.js # Karaoke recordings library
```

## UI/UX Design Decisions

### Color Scheme
- **Primary**: Purple/Pink gradients for karaoke mode
- **Recording Indicator**: Red pulse for active recording
- **Pause Indicator**: Yellow for paused state
- **Success**: Green for saved recordings
- **Icons**: Pink microphone for karaoke actions

### Typography
- **Lyrics**: Large (text-lg), light font weight, relaxed line height
- **Titles**: Bold, white text on dark backgrounds
- **Metadata**: Gray text for secondary information

### Layout
- **Desktop**: Side-by-side lyrics and recording studio
- **Responsive**: Stacks vertically on mobile devices
- **Full Screen**: Immersive experience without distractions

### Animations
- **Fade In**: Smooth entrance for notifications
- **Pulse**: Recording indicator animation
- **Hover Effects**: Scale and opacity changes on cards
- **Transitions**: Smooth color and background changes

## Performance Considerations

### File Size Management
- **Recording Limit**: 50MB per file
- **Format**: WebM for efficient compression
- **Cleanup**: Automatic file deletion on recording removal

### Database Optimization
- **Indexes**: Created on user, song, createdAt, isPublic fields
- **Pagination**: Community recordings limited to 50 results
- **Population**: Efficient joins with Song and User collections

### Browser Compatibility
- **MediaRecorder API**: Modern browsers (Chrome 49+, Firefox 25+, Safari 14.1+)
- **getUserMedia**: Requires HTTPS in production
- **Audio Element**: Universal browser support

## Security Considerations

### File Upload Security
- **File Type Validation**: Only audio MIME types accepted
- **Size Limit**: 50MB maximum
- **Path Sanitization**: Multer handles secure file naming
- **Authorization**: JWT token required for all endpoints

### Access Control
- **Ownership**: Users can only delete their own recordings
- **Privacy**: isPublic flag controls community visibility
- **Authentication**: All routes protected with auth middleware

### Data Validation
- **Song Existence**: Validates songId before recording upload
- **User Context**: Recordings tied to authenticated user
- **Input Sanitization**: Express validation on all inputs

## Future Enhancements

### Planned Features
1. **Real-time Lyrics Highlighting**: Sync lyrics with song playback
2. **Audio Effects**: Add reverb, echo, pitch correction
3. **Video Recording**: Record video karaoke sessions
4. **Social Sharing**: Share to social media platforms
5. **Duets**: Record with friends in real-time
6. **Leaderboards**: Top karaoke performers
7. **Challenges**: Weekly karaoke competitions
8. **Comments**: Discussion threads on recordings
9. **Playlists**: Create karaoke playlists
10. **Export Options**: Multiple audio formats (MP3, WAV, etc.)

### Technical Improvements
1. **Lyrics API Integration**: Auto-fetch lyrics from Genius or Musixmatch
2. **Cloud Storage**: Move to AWS S3 or similar for scalability
3. **Audio Mixing**: Combine original track with vocals
4. **Real-time Collaboration**: WebRTC for live duets
5. **Progressive Upload**: Upload while recording for long sessions
6. **Audio Visualization**: Waveform display during recording
7. **Mobile Apps**: Native iOS/Android karaoke apps
8. **Offline Mode**: Download songs and lyrics for offline karaoke

## Testing Guide

### Manual Testing Steps

#### 1. Test Recording Functionality
```bash
# Start servers
cd backend && npm start
cd frontend && npm start

# Login to application
# Navigate to any song
# Click three dots menu
# Click "Karaoke Mode"
# Grant microphone permission
# Click "Start Recording"
# Sing for 10 seconds
# Click "Stop Recording"
# Verify recording playback works
# Click "Save"
# Verify upload success message
```

#### 2. Test Library Features
```bash
# Click "Karaoke Library" in sidebar
# Verify "My Recordings" shows saved recording
# Click play button
# Verify audio plays
# Click download button
# Verify file downloads
# Switch to "Community" tab
# Verify public recordings display
# Click like button
# Verify like count increases
```

#### 3. Test Deletion
```bash
# In "My Recordings" tab
# Click delete button on a recording
# Confirm deletion
# Verify recording removed from list
# Check backend filesystem - file should be deleted
```

### Error Testing
1. **Microphone Permission Denied**: Verify graceful error message
2. **Large File Upload**: Try >50MB file, verify rejection
3. **Network Error**: Disconnect network, verify error handling
4. **Invalid Audio File**: Try uploading image, verify validation

## Troubleshooting

### Common Issues

#### Microphone Not Working
- **Check Browser Permissions**: Ensure microphone access granted
- **HTTPS Required**: getUserMedia requires secure context
- **Browser Compatibility**: Verify browser supports MediaRecorder API

#### Recording Not Saving
- **Check Token**: Ensure user is authenticated
- **File Size**: Verify recording under 50MB limit
- **Storage Space**: Check backend filesystem has space
- **Directory Permissions**: Ensure `public/recordings/` is writable

#### Lyrics Not Displaying
- **Database Check**: Verify song has lyrics in database
- **API Connection**: Check backend server is running
- **Authentication**: Ensure valid JWT token in localStorage

#### Audio Not Playing
- **File Path**: Check audioUrl is correct and accessible
- **Browser Support**: Verify browser supports WebM audio
- **CORS**: Ensure frontend can access backend static files

## Deployment Notes

### Production Checklist
- [ ] Configure cloud storage (S3, GCS) for recordings
- [ ] Set up CDN for audio file delivery
- [ ] Configure HTTPS for microphone access
- [ ] Set up database backups for recordings metadata
- [ ] Implement rate limiting on upload endpoints
- [ ] Add monitoring for storage usage
- [ ] Configure log aggregation for errors
- [ ] Set up automated cleanup of old recordings
- [ ] Implement content moderation for public recordings
- [ ] Add analytics tracking for karaoke usage

### Environment Variables
```env
# Backend .env
RECORDINGS_PATH=./frontend/public/recordings
MAX_RECORDING_SIZE=52428800  # 50MB in bytes
ENABLE_PUBLIC_RECORDINGS=true
```

## Analytics & Metrics

### Track These Metrics
- Total recordings created
- Average recording duration
- Most karaoke'd songs
- User engagement (plays, likes)
- Storage usage
- Conversion rate (recordings to saves)
- User retention with karaoke feature

## Credits & Acknowledgments
- **MediaRecorder API**: Browser native recording
- **Multer**: File upload handling
- **Lucide Icons**: Beautiful icon library
- **Tailwind CSS**: Styling framework
- **React**: UI framework

---

**Version**: 1.0.0  
**Last Updated**: October 16, 2025  
**Maintainer**: MusicCC Development Team
