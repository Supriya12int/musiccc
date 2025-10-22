# Play Next Feature Documentation

## Overview
The "Play Next" feature allows users to queue songs to play immediately after the currently playing song, giving them full control over their listening sequence.

## Implementation Details

### 1. Backend Changes
No backend changes were required - this is purely a frontend queue management feature.

### 2. Frontend Changes

#### MusicContext.js Updates
- **New Reducer Action**: Added `PLAY_NEXT` case to the musicReducer
  - Inserts a song at `currentIndex + 1` in the playlist array
  - Maintains existing queue order while prioritizing the selected song

- **New Function**: `playNext(song)`
  - If no song is currently playing, plays the song immediately
  - Otherwise, inserts the song into the queue to play next
  - Exposed in the MusicContext provider for use across components

#### SongCard.js Updates
- **New Import**: Added `ListPlus` icon from lucide-react
- **New State**: `showPlayNextNotification` to display feedback
- **New Handler**: `handlePlayNext()` function
  - Calls `playNext()` from MusicContext
  - Shows a notification for 2 seconds
  - Closes the menu automatically

- **Updated Menu**: Added "Play Next" as the first option in the dropdown menu
  - Purple-themed icon for visual distinction
  - Positioned at the top for easy access

- **Visual Feedback**: Purple notification banner appears when song is added
  - Shows "Added to Play Next" with animation
  - Auto-dismisses after 2 seconds

## User Experience Flow

1. User browses songs on the dashboard
2. User clicks the three-dot menu (⋯) on any song card
3. User clicks "Play Next" from the dropdown menu
4. A purple notification appears confirming the action
5. The song is queued to play immediately after the current song
6. When the current song ends, the queued song plays next (unless shuffle is on)

## Features

✅ **Queue Management**: Songs are inserted at the next position in queue
✅ **Visual Feedback**: Purple notification confirms the action
✅ **Smart Behavior**: If no song is playing, the song starts immediately
✅ **Menu Integration**: Seamlessly integrated into existing song options
✅ **Animation**: Smooth fade-in animation for notifications

## Technical Implementation

### Queue Logic
```javascript
case 'PLAY_NEXT':
  const newPlaylist = [...state.playlist];
  const insertIndex = state.currentIndex + 1;
  newPlaylist.splice(insertIndex, 0, action.payload);
  return {
    ...state,
    playlist: newPlaylist,
  };
```

### Function Logic
```javascript
const playNext = (song) => {
  if (!state.currentSong) {
    playSong(song, [song], 0);
  } else {
    dispatch({ type: 'PLAY_NEXT', payload: song });
  }
};
```

## Future Enhancements

Potential improvements for this feature:
- Show queue view with ability to reorder songs
- "Add to Queue" option to add at the end instead of next
- Bulk queue management (clear queue, remove songs)
- Queue history and undo functionality
- Persistent queue across sessions

## Testing

To test this feature:
1. Start the backend: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm start`
3. Login to the application
4. Play a song from the dashboard
5. Click the three-dot menu on another song
6. Click "Play Next"
7. Observe the purple notification
8. Wait for the current song to end or click next
9. The queued song should play

## Files Modified

- `frontend/src/context/MusicContext.js`: Added queue management logic
- `frontend/src/components/SongCard.js`: Added UI for Play Next button
