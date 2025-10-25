import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, Check, Music, ExternalLink, ListPlus, Mic } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { libraryAPI } from '../services/api';

const SongCard = ({ song, onPlay, onKaraoke }) => {
  const { currentSong, isPlaying, playNext } = useMusic();
  const [showMenu, setShowMenu] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPlayNextNotification, setShowPlayNextNotification] = useState(false);
  const menuRef = useRef(null);
  const isCurrentSong = currentSong?._id === song._id;

  useEffect(() => {
    checkLibraryStatus();
  }, [song._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkLibraryStatus = async () => {
    try {
      const response = await libraryAPI.checkInLibrary(song._id);
      setIsInLibrary(response.data.isInLibrary);
    } catch (error) {
      console.error('Error checking library status:', error);
    }
  };

  const handleLibraryToggle = async () => {
    setLoading(true);
    try {
      if (isInLibrary) {
        await libraryAPI.removeFromLibrary(song._id);
        setIsInLibrary(false);
      } else {
        await libraryAPI.addToLibrary(song._id);
        setIsInLibrary(true);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating library:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNext = () => {
    playNext(song);
    setShowMenu(false);
    setShowPlayNextNotification(true);
    setTimeout(() => setShowPlayNextNotification(false), 2000);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200 group cursor-pointer relative">
      {/* Play Next Notification */}
      {showPlayNextNotification && (
        <div className="absolute top-2 left-2 right-2 bg-purple-600 text-white text-xs py-2 px-3 rounded-lg shadow-lg z-50 flex items-center fade-in">
          <ListPlus className="h-4 w-4 mr-2" />
          Added to Play Next
        </div>
      )}
      
      {/* Cover Image */}
      <div className="relative mb-3">
        <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden">
          {song.albumImageUrl || song.coverImage ? (
            <img
              src={song.albumImageUrl || song.coverImage}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
          <button
            onClick={onPlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isCurrentSong && isPlaying
                ? 'bg-purple-600 opacity-100'
                : 'bg-white bg-opacity-0 group-hover:bg-opacity-100 opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-black ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Song Info */}
      <div>
        <h3 className={`font-medium text-sm mb-1 truncate ${
          isCurrentSong ? 'text-purple-400' : 'text-white'
        }`}>
          {song.title}
        </h3>
        <p className="text-gray-400 text-xs mb-2 truncate">{song.artist}</p>
        
        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDuration(song.duration)}</span>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="hover:text-red-400 transition-colors duration-200">
              <Heart className="h-4 w-4" />
            </button>
            
            {/* Play Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayNext();
              }}
              className="hover:text-purple-400 transition-colors duration-200"
              title="Play Next"
            >
              <ListPlus className="h-4 w-4" />
            </button>
            
            {/* Three Dots Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="hover:text-white transition-colors duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-6 z-50 bg-gray-700 rounded-lg shadow-xl py-2 min-w-48">
                  <button
                    onClick={handlePlayNext}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors duration-200 flex items-center"
                  >
                    <ListPlus className="h-4 w-4 mr-3 text-purple-400" />
                    Play Next
                  </button>
                  
                  {onKaraoke && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onKaraoke(song);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors duration-200 flex items-center"
                    >
                      <Mic className="h-4 w-4 mr-3 text-pink-400" />
                      Karaoke Mode
                    </button>
                  )}
                  
                  <button
                    onClick={handleLibraryToggle}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors duration-200 flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                    ) : isInLibrary ? (
                      <Check className="h-4 w-4 mr-3 text-green-400" />
                    ) : (
                      <Plus className="h-4 w-4 mr-3" />
                    )}
                    {isInLibrary ? 'Remove from Library' : 'Add to Library'}
                  </button>
                  
                  {song.spotifyUrl && (
                    <button
                      onClick={() => window.open(song.spotifyUrl, '_blank')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors duration-200 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-3 text-green-400" />
                      Open in Spotify
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (window.openPlaylistModal) {
                        window.openPlaylistModal(song);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 transition-colors duration-200 flex items-center"
                  >
                    <Music className="h-4 w-4 mr-3" />
                    Add to Playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Play Count & Library Status */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            {song.playCount > 0 && (
              <div className="text-xs text-gray-500">
                {song.playCount.toLocaleString()} plays
              </div>
            )}
            {song.previewUrl && (
              <div className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                Spotify
              </div>
            )}
          </div>
          {isInLibrary && (
            <div className="text-xs text-green-400 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              In Library
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongCard;