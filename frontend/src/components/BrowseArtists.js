import React, { useState, useEffect } from 'react';
import { artistsAPI } from '../services/api';
import ArtistCard from './ArtistCard';
import { Users, Search } from 'lucide-react';

const BrowseArtists = ({ onArtistSelect }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArtists, setFilteredArtists] = useState([]);

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArtists(artists);
    } else {
      const filtered = artists.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArtists(filtered);
    }
  }, [searchTerm, artists]);

  const loadArtists = async () => {
    try {
      const response = await artistsAPI.getPopularArtists();
      setArtists(response.data);
      setFilteredArtists(response.data);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpdate = (artistName, isFollowing) => {
    setArtists(prevArtists =>
      prevArtists.map(artist =>
        artist.name === artistName
          ? { ...artist, isFollowing }
          : artist
      )
    );
    setFilteredArtists(prevArtists =>
      prevArtists.map(artist =>
        artist.name === artistName
          ? { ...artist, isFollowing }
          : artist
      )
    );
  };

  const handleArtistClick = (artist) => {
    if (onArtistSelect) {
      onArtistSelect(artist);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative bg-gradient-to-r from-purple-900/30 to-blue-900/30 px-8 py-12 mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-6 animate-pulse">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Discover Artists</h1>
                <p className="text-gray-300 text-lg">Loading amazing artists for you...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-700 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-900/30 to-blue-900/30 px-8 py-12 mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Discover Artists</h1>
                <p className="text-gray-300 text-lg">Explore talented musicians and find your new favorites</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{filteredArtists.length}</div>
                <div className="text-purple-300">Artists Available</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for artists, genres, or styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">

        {filteredArtists.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              {searchTerm ? 'No artists found' : 'No artists available'}
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              {searchTerm 
                ? `We couldn't find any artists matching "${searchTerm}". Try a different search term.`
                : 'Check back later for more amazing artists to discover'
              }
            </p>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-white">
                  {searchTerm ? `Search Results for "${searchTerm}"` : 'All Artists'}
                </h2>
                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                  {filteredArtists.length} artists
                </span>
              </div>
            </div>

            {/* Artists Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredArtists.map((artist) => (
                <ArtistCard
                  key={artist.name}
                  artist={artist}
                  isFollowing={artist.isFollowing}
                  onFollowChange={handleFollowUpdate}
                  onViewSongs={() => handleArtistClick(artist)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseArtists;