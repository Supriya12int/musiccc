import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Plus, 
  Play, 
  Pause, 
  MoreHorizontal, 
  Edit, 
  Delete, 
  Lock, 
  Globe, 
  Clock,
  Heart,
  Share2,
  Loader
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { playlistsAPI } from '../services/api';
import PlaylistModal from '../components/PlaylistModal';

const PlaylistsPage = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = useMusic();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [newPlaylistData, setNewPlaylistData] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistsAPI.getUserPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song, playlist) => {
    if (currentSong && currentSong._id === song._id) {
      togglePlayPause();
    } else {
      const songIndex = playlist.songs.findIndex(s => s._id === song._id);
      playSong(song, playlist.songs, songIndex);
    }
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs, 0);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await playlistsAPI.deletePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p._id !== playlistId));
      if (selectedPlaylist && selectedPlaylist._id === playlistId) {
        setSelectedPlaylist(null);
      }
      alert('Playlist deleted successfully');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistData.name.trim()) return;

    try {
      const response = await playlistsAPI.createPlaylist(newPlaylistData);
      setPlaylists([response.data.playlist, ...playlists]);
      setNewPlaylistData({ name: '', description: '', isPublic: false });
      setShowCreateModal(false);
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      await playlistsAPI.removeSongFromPlaylist(playlistId, songId);
      
      // Update the selected playlist
      if (selectedPlaylist && selectedPlaylist._id === playlistId) {
        setSelectedPlaylist({
          ...selectedPlaylist,
          songs: selectedPlaylist.songs.filter(song => song._id !== songId)
        });
      }
      
      // Update playlists list
      setPlaylists(playlists.map(playlist => 
        playlist._id === playlistId
          ? { ...playlist, songs: playlist.songs.filter(song => song._id !== songId) }
          : playlist
      ));
      
      alert('Song removed from playlist');
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      alert('Failed to remove song from playlist');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading your playlists...</div>
          <div className="text-slate-400 text-sm mt-2">Organizing your music collections</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Your Music Collections</h1>
                <p className="text-slate-300 text-lg">
                  {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'} • 
                  <span className="ml-2 text-slate-400">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Create Playlist</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Professional Sidebar */}
        <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Collections</h2>
            
            {playlists.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No playlists yet</h3>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  Create your first playlist to start organizing your favorite music
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    onClick={() => setSelectedPlaylist(playlist)}
                    className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPlaylist?._id === playlist._id
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30'
                        : 'bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedPlaylist?._id === playlist._id
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          : 'bg-slate-600/50 group-hover:bg-slate-600'
                      } transition-all duration-200`}>
                        {playlist.coverImage ? (
                          <img
                            src={playlist.coverImage}
                            alt={playlist.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Music className="h-7 w-7 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {playlist.songs?.length || 0} song{(playlist.songs?.length || 0) !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {playlist.isPublic ? (
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3 text-green-400" />
                              <span className="text-xs text-green-400 font-medium">Public</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Lock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-400">Private</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Professional Main Content */}
        <div className="flex-1 p-8">
          {selectedPlaylist ? (
            <div>
              {/* Professional Playlist Header */}
              <div className="flex items-start space-x-8 mb-10">
                <div className="w-56 h-56 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {selectedPlaylist.coverImage ? (
                    <img
                      src={selectedPlaylist.coverImage}
                      alt={selectedPlaylist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
                      <Music className="h-20 w-20 text-blue-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 pt-4">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Playlist</span>
                  </div>
                  <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                    {selectedPlaylist.name}
                  </h1>
                  
                  {selectedPlaylist.description && (
                    <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-2xl">
                      {selectedPlaylist.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-slate-400 mb-8">
                    <div className="flex items-center space-x-2">
                      <Music className="h-5 w-5" />
                      <span className="font-medium">{selectedPlaylist.songs?.length || 0} songs</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>
                        {selectedPlaylist.songs?.reduce((total, song) => total + (song.duration || 0), 0) > 0 && 
                          `${Math.floor(selectedPlaylist.songs.reduce((total, song) => total + (song.duration || 0), 0) / 60)} min`
                        }
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      {selectedPlaylist.isPublic ? (
                        <>
                          <Globe className="h-5 w-5 text-green-400" />
                          <span className="text-green-400">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {selectedPlaylist.songs?.length > 0 && (
                      <button
                        onClick={() => handlePlayPlaylist(selectedPlaylist)}
                        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Play className="h-7 w-7 ml-1" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deletePlaylist(selectedPlaylist._id)}
                      className="w-12 h-12 bg-slate-700/50 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <Delete className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Professional Songs List */}
              <div>
                {selectedPlaylist.songs?.length > 0 ? (
                  <div className="bg-slate-800/30 rounded-2xl overflow-hidden backdrop-blur-sm border border-slate-700/50">
                    {/* Table Header */}
                    <div className="px-8 py-4 border-b border-slate-700/50 bg-slate-800/50">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-400 uppercase tracking-wider">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-5">Title</div>
                        <div className="col-span-3">Album</div>
                        <div className="col-span-2 text-center">Actions</div>
                        <div className="col-span-1 text-center">
                          <Clock className="h-4 w-4 mx-auto" />
                        </div>
                      </div>
                    </div>

                    {/* Songs List */}
                    <div className="divide-y divide-slate-700/30">
                      {selectedPlaylist.songs.map((song, index) => (
                        <div
                          key={song._id}
                          className="px-8 py-4 hover:bg-slate-700/20 transition-all duration-200 group"
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Track Number / Play Button */}
                            <div className="col-span-1 text-center">
                              <div className="relative">
                                <span className="text-slate-400 group-hover:opacity-0 transition-opacity text-sm font-medium">
                                  {index + 1}
                                </span>
                                <button
                                  onClick={() => handlePlaySong(song, selectedPlaylist)}
                                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center mx-auto"
                                >
                                  {currentSong?._id === song._id && isPlaying ? (
                                    <Pause className="h-4 w-4 text-white" />
                                  ) : (
                                    <Play className="h-4 w-4 text-white ml-0.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Song Title & Cover */}
                            <div className="col-span-5 flex items-center space-x-4">
                              <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                {song.coverImage || song.albumImageUrl ? (
                                  <img
                                    src={song.coverImage || song.albumImageUrl}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
                                    <Music className="h-6 w-6 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-white font-medium text-base truncate group-hover:text-blue-400 transition-colors">
                                  {song.title}
                                </h3>
                                <p className="text-slate-400 text-sm truncate mt-0.5">{song.artist}</p>
                              </div>
                            </div>

                            {/* Album */}
                            <div className="col-span-3">
                              {song.album && (
                                <p className="text-slate-300 text-sm truncate hover:text-white transition-colors">
                                  {song.album}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 text-center">
                              <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setSelectedSongForPlaylist(song);
                                    setPlaylistModalOpen(true);
                                  }}
                                  className="w-8 h-8 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full flex items-center justify-center transition-all duration-200"
                                  title="Add to another playlist"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => removeSongFromPlaylist(selectedPlaylist._id, song._id)}
                                  className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full flex items-center justify-center transition-all duration-200"
                                  title="Remove from playlist"
                                >
                                  <Delete className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="col-span-1 text-center">
                              <span className="text-slate-400 text-sm">
                                {formatDuration(song.duration || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/30 rounded-2xl p-12 text-center backdrop-blur-sm border border-slate-700/50">
                    <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Music className="h-16 w-16 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">No songs in this playlist</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Start building your playlist by adding songs from the music library.
                    </p>
                    <button
                      onClick={() => setSelectedPlaylist(null)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Browse Music
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Music className="h-16 w-16 text-slate-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Select a playlist</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Choose a playlist from the sidebar to view its songs and start listening
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Create New Playlist</h2>
            </div>
            
            <form onSubmit={createPlaylist} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistData.name}
                  onChange={(e) => setNewPlaylistData({ ...newPlaylistData, name: e.target.value })}
                  placeholder="Enter playlist name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newPlaylistData.description}
                  onChange={(e) => setNewPlaylistData({ ...newPlaylistData, description: e.target.value })}
                  placeholder="Add a description for your playlist"
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublicNew"
                  checked={newPlaylistData.isPublic}
                  onChange={(e) => setNewPlaylistData({ ...newPlaylistData, isPublic: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isPublicNew" className="text-slate-300 font-medium">
                  Make this playlist public
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistData.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Modal for Adding Songs */}
      <PlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        song={selectedSongForPlaylist}
        onSuccess={() => {
          setPlaylistModalOpen(false);
          fetchPlaylists();
        }}
      />
    </div>
  );
};

export default PlaylistsPage;