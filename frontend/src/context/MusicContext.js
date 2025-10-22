import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const MusicContext = createContext();

const initialState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  playlist: [],
  currentIndex: 0,
  repeat: false,
  shuffle: false,
  loading: false,
  recentlyPlayed: [],
};

const musicReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return {
        ...state,
        currentSong: action.payload.song,
        playlist: action.payload.playlist || state.playlist,
        currentIndex: action.payload.index !== undefined ? action.payload.index : state.currentIndex,
      };
    case 'ADD_TO_RECENTLY_PLAYED':
      const song = action.payload;
      const existingIndex = state.recentlyPlayed.findIndex(s => s._id === song._id);
      let newRecentlyPlayed;
      
      if (existingIndex !== -1) {
        // Move existing song to the front
        newRecentlyPlayed = [
          song,
          ...state.recentlyPlayed.filter(s => s._id !== song._id)
        ];
      } else {
        // Add new song to the front
        newRecentlyPlayed = [song, ...state.recentlyPlayed];
      }
      
      // Keep only the last 20 recently played songs
      return {
        ...state,
        recentlyPlayed: newRecentlyPlayed.slice(0, 20)
      };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload };
    case 'NEXT_SONG':
      const nextIndex = state.shuffle 
        ? Math.floor(Math.random() * state.playlist.length)
        : (state.currentIndex + 1) % state.playlist.length;
      return {
        ...state,
        currentIndex: nextIndex,
        currentSong: state.playlist[nextIndex] || null,
      };
    case 'PREVIOUS_SONG':
      const prevIndex = state.currentIndex === 0 
        ? state.playlist.length - 1 
        : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentSong: state.playlist[prevIndex] || null,
      };
    case 'PLAY_NEXT':
      // Insert song at currentIndex + 1 to play next
      const newPlaylist = [...state.playlist];
      const insertIndex = state.currentIndex + 1;
      newPlaylist.splice(insertIndex, 0, action.payload);
      return {
        ...state,
        playlist: newPlaylist,
      };
    case 'TOGGLE_REPEAT':
      return { ...state, repeat: !state.repeat };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const MusicProvider = ({ children }) => {
  const [state, dispatch] = useReducer(musicReducer, initialState);
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    // Event listeners
    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };
    
    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
    };
    
    const handleEnded = () => {
      if (state.repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', audio.src);
      console.error('Error details:', audio.error);
    };

    const handleCanPlay = () => {
      console.log('✅ Audio ready');
    };

    const handleLoadStart = () => {
      console.log('⏳ Audio load started:', audio.src);
    };

    const handleLoadedData = () => {
      console.log('📁 Audio data loaded:', audio.src);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [state.repeat]);

  // Update audio when current song changes  
  useEffect(() => {
    if (state.currentSong && audioRef.current) {
      const audioUrl = state.currentSong.audioUrl || '';
      const fullUrl = `http://localhost:5000${audioUrl}`;
      
      console.log('🎵 Switching to:', state.currentSong.title);
      console.log('🔗 URL:', fullUrl);
      
      const audio = audioRef.current;
      
      // Properly stop and reset previous audio
      audio.pause();
      audio.currentTime = 0;
      
      // Clear the src to stop any loading
      audio.src = '';
      audio.removeAttribute('src');
      
      // Wait a bit then load new song
      setTimeout(() => {
        audio.src = fullUrl;
        audio.volume = state.volume || 0.7;
        audio.load();
        console.log('✅ New song loaded:', state.currentSong.title);
      }, 100);
    }
  }, [state.currentSong]);

  // Play/pause control
  useEffect(() => {
    if (audioRef.current && state.currentSong) {
      if (state.isPlaying) {
        console.log('▶️ Trying to play:', state.currentSong.title);
        
        // Wait for audio to be ready before playing
        const audio = audioRef.current;
        
        const attemptPlay = () => {
          if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            audio.play().then(() => {
              console.log('✅ Successfully playing:', state.currentSong.title);
            }).catch(error => {
              console.error('❌ Play failed:', error);
            });
          } else {
            // Wait a bit more for audio to load
            setTimeout(attemptPlay, 200);
          }
        };
        
        attemptPlay();
      } else {
        audioRef.current.pause();
        console.log('⏸️ Paused');
      }
    }
  }, [state.isPlaying, state.currentSong]);

  const playSong = (song, playlist = [], index = 0) => {
    console.log('🎵 Playing song:', song.title, 'by', song.artist);
    console.log('🔗 Audio URL:', song.audioUrl);
    console.log('📼 Playlist length:', playlist.length);
    
    dispatch({
      type: 'SET_CURRENT_SONG',
      payload: { song, playlist, index },
    });
    dispatch({ type: 'PLAY' });
    
    // Add to recently played when song starts playing
    dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: song });
  };

  const playNext = (song) => {
    // If no current song, play immediately
    if (!state.currentSong) {
      playSong(song, [song], 0);
    } else {
      // Otherwise, insert after current song in queue
      dispatch({ type: 'PLAY_NEXT', payload: song });
    }
  };

  const play = () => {
    dispatch({ type: 'PLAY' });
  };

  const pause = () => {
    dispatch({ type: 'PAUSE' });
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextSong = () => {
    if (state.playlist.length > 0) {
      dispatch({ type: 'NEXT_SONG' });
    }
  };

  const previousSong = () => {
    if (state.playlist.length > 0) {
      dispatch({ type: 'PREVIOUS_SONG' });
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  };

  const setVolume = (volume) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const setPlaylist = (playlist) => {
    dispatch({ type: 'SET_PLAYLIST', payload: playlist });
  };

  const value = {
    ...state,
    playSong,
    playNext,
    play,
    pause,
    togglePlayPause,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    setPlaylist,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;