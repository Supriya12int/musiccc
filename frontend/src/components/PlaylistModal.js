import React, { useState, useEffect } from 'react';
import { X, Plus, Music, Check, AlertCircle, Loader } from 'lucide-react';
import { playlistsAPI } from '../services/api';

const PlaylistModal = ({ isOpen, onClose, song, onSuccess }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistsAPI.getUserPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setMessage('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setCreating(true);
      const response = await playlistsAPI.createPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDescription.trim(),
        isPublic: false
      });

      setPlaylists([response.data.playlist, ...playlists]);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);
      setMessage('✅ Playlist created successfully!');
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setMessage('❌ Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  const addSongToPlaylist = async (playlistId) => {
    try {
      setAddingToPlaylist(playlistId);
      await playlistsAPI.addSongToPlaylist(playlistId, song._id);
      
      const playlistName = playlists.find(p => p._id === playlistId)?.name || 'playlist';
      setMessage(`✅ "${song.title}" added to "${playlistName}"!`);
      
      if (onSuccess) onSuccess();
      
      // Auto-close modal after success
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      if (error.response?.data?.message === 'Song already in playlist') {
        setMessage('⚠️ Song is already in this playlist');
      } else {
        setMessage('❌ Failed to add song to playlist');
      }
    } finally {
      setAddingToPlaylist(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
            {song && (
              <p className="text-gray-400 text-sm mt-1">
                "{song.title}" by {song.artist}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Status Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg border ${
              message.includes('✅') 
                ? 'bg-green-900/20 border-green-500 text-green-200'
                : message.includes('❌')
                ? 'bg-red-900/20 border-red-500 text-red-200'
                : 'bg-yellow-900/20 border-yellow-500 text-yellow-200'
            }`}>
              <div className="flex items-center">
                {message.includes('✅') ? (
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                {message}
              </div>
            </div>
          )}

          {/* Create New Playlist Button */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Playlist</span>
          </button>

          {/* Create Playlist Form */}
          {showCreateForm && (
            <form onSubmit={createPlaylist} className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
              <h3 className="text-white font-medium mb-3">Create New Playlist</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={creating || !newPlaylistName.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded font-medium transition-colors flex items-center justify-center"
                  >
                    {creating ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 text-purple-400 animate-spin" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">You don't have any playlists yet</p>
              <p className="text-gray-500 text-sm">Create your first playlist to get started!</p>
            </div>
          ) : (
            /* Playlists List */
            <div className="space-y-2">
              <h3 className="text-white font-medium mb-3">Your Playlists</h3>
              
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                  onClick={() => addSongToPlaylist(playlist._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center">
                      {playlist.coverImage ? (
                        <img
                          src={playlist.coverImage}
                          alt={playlist.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Music className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-white font-medium">{playlist.name}</p>
                      <p className="text-gray-400 text-sm">
                        {playlist.songs?.length || 0} song{(playlist.songs?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {addingToPlaylist === playlist._id ? (
                    <Loader className="h-5 w-5 text-purple-400 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;