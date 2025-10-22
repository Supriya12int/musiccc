import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Heart, ExternalLink } from 'lucide-react';

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    togglePlayPause,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleRepeat,
    toggleShuffle,
  } = useMusic();

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (e) => {
    const volumeBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = volumeBar.offsetWidth;
    const newVolume = clickX / width;
    setVolume(newVolume);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
            {currentSong.coverImage ? (
              <img
                src={currentSong.coverImage}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Play className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
            <div className="flex items-center space-x-2">
              <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
              {currentSong.previewUrl && (
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                  Preview
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentSong.spotifyUrl && (
              <button
                onClick={() => window.open(currentSong.spotifyUrl, '_blank')}
                className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                title="Open in Spotify"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
            <button className="text-gray-400 hover:text-red-400 transition-colors duration-200">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors duration-200 ${
                shuffle ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={previousSong}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`transition-colors duration-200 ${
                repeat ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-purple-400 rounded-full relative"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Volume2 className="h-4 w-4 text-gray-400" />
          <div
            className="w-20 h-1 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleVolumeChange}
          >
            <div
              className="h-full bg-purple-400 rounded-full"
              style={{ width: `${volume * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;