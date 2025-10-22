import React, { useState } from 'react';
import { User, UserPlus, UserMinus, Music, Play } from 'lucide-react';
import { artistsAPI } from '../services/api';

const ArtistCard = ({ artist, isFollowing, onFollowChange, onViewSongs }) => {
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      if (isFollowing) {
        await artistsAPI.unfollowArtist(artist.name);
      } else {
        await artistsAPI.followArtist(artist.name);
      }
      onFollowChange(artist.name, !isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="group cursor-pointer">
      <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 border border-gray-700/50 hover:border-purple-500/30 overflow-hidden">
        
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
        {/* Artist Avatar */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl overflow-hidden flex items-center justify-center border border-purple-500/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl flex items-center justify-center">
            <button
              onClick={() => onViewSongs(artist)}
              className="w-12 h-12 bg-white/0 group-hover:bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 hover:bg-white"
            >
              <Play className="h-5 w-5 text-gray-900 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Artist Info */}
        <div className="text-center">
          <h3 className="font-semibold text-white mb-2 truncate text-lg group-hover:text-purple-200 transition-colors">
            {artist.name}
          </h3>
          
          {/* Stats */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-center space-x-1 text-gray-400">
              <Music className="h-3 w-3" />
              <span className="text-sm">{artist.songCount || 0} songs</span>
            </div>
            {artist.totalPlays > 0 && (
              <div className="text-xs text-gray-500">
                {formatPlays(artist.totalPlays)} plays
              </div>
            )}
          </div>

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {artist.genres.slice(0, 2).map((genre, index) => (
                <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Follow Button */}
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 transform opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 ${
              isFollowing
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/25'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25'
            } disabled:opacity-50 hover:shadow-xl`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
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
  );
};

export default ArtistCard;