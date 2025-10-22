import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { musicAPI, artistsAPI } from '../services/api';
import SongCard from './SongCard';
import { User, Music, Users, Play, UserPlus, UserMinus, ArrowLeft } from 'lucide-react';

const ArtistPage = ({ artist, onBack }) => {
  const { playSong } = useMusic();
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(artist?.isFollowing || false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (artist) {
      loadArtistSongs();
      checkFollowStatus();
    }
  }, [artist]);

  const loadArtistSongs = async () => {
    try {
      setLoading(true);
      // Get all songs and filter by artist
      const response = await musicAPI.getSongs();
      const songs = response.data.songs || response.data;
      
      // Filter songs by this artist
      const filteredSongs = songs.filter(song => 
        song.artist.toLowerCase().includes(artist.name.toLowerCase()) ||
        artist.name.toLowerCase().includes(song.artist.toLowerCase())
      );
      
      setArtistSongs(filteredSongs);
    } catch (error) {
      console.error('Error loading artist songs:', error);
      setArtistSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await artistsAPI.getFollowedArtists();
      const followedArtists = response.data;
      const isArtistFollowed = followedArtists.some(a => a.name === artist.name);
      setIsFollowing(isArtistFollowed);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await artistsAPI.unfollowArtist(artist.name);
        setIsFollowing(false);
      } else {
        await artistsAPI.followArtist(artist.name);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePlaySong = (song, songList = artistSongs) => {
    const songIndex = songList.findIndex(s => s._id === song._id);
    playSong(song, songList, songIndex);
  };

  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      handlePlaySong(artistSongs[0], artistSongs);
    }
  };

  const formatPlays = (plays) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`;
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`;
    }
    return plays?.toString() || '0';
  };

  if (!artist) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Artists
        </button>

        <div className="flex items-start space-x-6">
          {/* Artist Avatar */}
          <div className="w-48 h-48 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-24 w-24 text-gray-400" />
          </div>

          {/* Artist Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{artist.name}</h1>
            
            <div className="flex items-center space-x-6 mb-4 text-gray-400">
              <div className="flex items-center">
                <Music className="h-5 w-5 mr-2" />
                <span>{artistSongs.length} songs</span>
              </div>
              {artist.totalPlays > 0 && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{formatPlays(artist.totalPlays)} total plays</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {artist.genres && artist.genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayAll}
                disabled={artistSongs.length === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full flex items-center space-x-2 transition-colors duration-200"
              >
                <Play className="h-5 w-5" />
                <span>Play All</span>
              </button>

              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-6 py-3 rounded-full border-2 flex items-center space-x-2 transition-colors duration-200 ${
                  isFollowing
                    ? 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
                    : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
                }`}
              >
                {followLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-5 w-5" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        <span>Follow</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Songs</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading songs...</div>
          </div>
        ) : artistSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artistSongs.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                onPlay={() => handlePlaySong(song, artistSongs)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No songs available</h3>
            <p className="text-gray-500">
              This artist doesn't have any songs in our library yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;