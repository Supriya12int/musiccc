import React, { useState, useEffect } from 'react';
import { artistsAPI } from '../services/api';
import ArtistCard from './ArtistCard';
import BrowseArtists from './BrowseArtists';
import { Heart, Users, Music, TrendingUp, Search } from 'lucide-react';

const FollowedArtists = ({ onArtistSelect }) => {
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBrowse, setShowBrowse] = useState(false);

  useEffect(() => {
    loadFollowedArtists();
  }, []);

  const loadFollowedArtists = async () => {
    try {
      const response = await artistsAPI.getFollowedArtists();
      setFollowedArtists(response.data);
    } catch (error) {
      console.error('Error loading followed artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpdate = (artistName, isFollowing) => {
    if (!isFollowing) {
      // Remove artist from the list when unfollowed
      setFollowedArtists(prevArtists =>
        prevArtists.filter(artist => artist.name !== artistName)
      );
    }
  };

  const handleArtistClick = (artist) => {
    if (onArtistSelect) {
      onArtistSelect(artist);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading your favorite artists...</div>
      </div>
    );
  }

  if (showBrowse) {
    return <BrowseArtists onArtistSelect={onArtistSelect} />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Following</h1>
          </div>
          <button
            onClick={() => setShowBrowse(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Search className="h-4 w-4" />
            <span>Discover Artists</span>
          </button>
        </div>
        <p className="text-gray-400">Artists you're following</p>
      </div>

      {followedArtists.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
            <Heart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No artists followed yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start following your favorite artists to see them here and get updates on their latest music
            </p>
            <button 
              onClick={() => setShowBrowse(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Discover Artists
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-white mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white">{followedArtists.length}</p>
                  <p className="text-purple-200 text-sm">Following</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">
              <div className="flex items-center">
                <Music className="h-8 w-8 text-white mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {followedArtists.reduce((total, artist) => total + (artist.songCount || 0), 0)}
                  </p>
                  <p className="text-blue-200 text-sm">Total Songs</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-white mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {followedArtists.reduce((total, artist) => total + (artist.totalPlays || 0), 0)}
                  </p>
                  <p className="text-green-200 text-sm">Total Plays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Your Artists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {followedArtists.map((artist) => (
                <ArtistCard
                  key={artist.name}
                  artist={artist}
                  isFollowing={true}
                  onFollowChange={handleFollowUpdate}
                  onViewSongs={() => handleArtistClick(artist)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FollowedArtists;