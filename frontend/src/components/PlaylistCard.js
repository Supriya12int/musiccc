import React from 'react';
import { Play, Music, MoreHorizontal } from 'lucide-react';

const PlaylistCard = ({ playlist }) => {
  const songCount = playlist.songs?.length || 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200 group cursor-pointer">
      {/* Cover Image */}
      <div className="relative mb-3">
        <div className="aspect-square bg-gray-600 rounded-lg overflow-hidden">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
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
          <button className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Play className="h-6 w-6 text-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* Playlist Info */}
      <div>
        <h3 className="font-medium text-sm mb-1 truncate text-white">
          {playlist.name}
        </h3>
        <p className="text-gray-400 text-xs mb-2 truncate">
          {playlist.description || 'No description'}
        </p>
        
        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{songCount} song{songCount !== 1 ? 's' : ''}</span>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="hover:text-white transition-colors duration-200">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Privacy Status */}
        <div className="mt-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${
            playlist.isPublic 
              ? 'bg-green-900 text-green-400' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            {playlist.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;