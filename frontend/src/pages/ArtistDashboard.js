import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { musicAPI, spotifyAPI } from '../services/api';
import { Upload, Music, TrendingUp, Clock, Plus, MoreVertical, Trash2 } from 'lucide-react';

const ArtistDashboard = () => {
  const { user, logout } = useAuth();
  const [uploadData, setUploadData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: '',
    audioUrl: '',
    coverImage: '',
    lyrics: ''
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [mySongs, setMySongs] = useState([]);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalPlays: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deletingId, setDeletingId] = useState(null);
  const [uploadBusy, setUploadBusy] = useState({ audio: false, cover: false, youtube: false, spotify: false });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [songsResponse, statsResponse] = await Promise.all([
        musicAPI.getMySongs(),
        musicAPI.getArtistStats()
      ]);
      
      setMySongs(songsResponse.data.songs);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      await musicAPI.addSong(uploadData);
      setMessage('Song uploaded successfully!');
      setUploadData({
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: '',
        audioUrl: '',
        coverImage: '',
        lyrics: ''
      });
      // Reload dashboard data to show new song
      loadDashboardData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Delete this song? This will also remove related karaoke recordings from your account.')) {
      return;
    }
    try {
      setDeletingId(songId);
      await musicAPI.deleteSong(songId);
      // Refresh list and stats to reflect deletion
      await loadDashboardData();
      setMessage('Song deleted successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete song');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAudioFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy((s) => ({ ...s, audio: true }));
    setMessage('');
    try {
      const { data } = await musicAPI.uploadAudio(file);
      setUploadData((u) => ({ ...u, audioUrl: data.url }));
      setMessage('Audio uploaded. URL filled automatically.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload audio');
    } finally {
      setUploadBusy((s) => ({ ...s, audio: false }));
    }
  };

  const handleCoverFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy((s) => ({ ...s, cover: true }));
    setMessage('');
    try {
      const { data } = await musicAPI.uploadCover(file);
      setUploadData((u) => ({ ...u, coverImage: data.url }));
      setMessage('Cover image uploaded. URL filled automatically.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploadBusy((s) => ({ ...s, cover: false }));
    }
  };

  const handleYouTubeDownload = async () => {
    if (!youtubeUrl.trim()) {
      setMessage('Please enter a YouTube URL');
      return;
    }
    setUploadBusy((s) => ({ ...s, youtube: true }));
    setMessage('');
    try {
      const { data } = await musicAPI.downloadFromYouTube(youtubeUrl);
      setUploadData((u) => ({
        ...u,
        audioUrl: data.url,
        title: u.title || data.title,
        duration: u.duration || data.duration,
        coverImage: u.coverImage || data.thumbnail
      }));
      setMessage('Audio downloaded from YouTube! Fields auto-filled.');
      setYoutubeUrl('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to download from YouTube');
    } finally {
      setUploadBusy((s) => ({ ...s, youtube: false }));
    }
  };

  const handleSpotifySearch = async () => {
    if (!spotifyQuery.trim()) {
      setMessage('Please enter a search query');
      return;
    }
    setUploadBusy((s) => ({ ...s, spotify: true }));
    setMessage('');
    try {
      const { data } = await spotifyAPI.search(spotifyQuery);
      setSpotifyResults(data.tracks || []);
      setShowSpotifySearch(true);
      setMessage(`Found ${data.tracks?.length || 0} songs on Spotify`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to search Spotify');
    } finally {
      setUploadBusy((s) => ({ ...s, spotify: false }));
    }
  };

  const handleSpotifyImport = async (track) => {
    setUploadBusy((s) => ({ ...s, spotify: true }));
    setMessage('');
    try {
      setUploadData({
        title: track.name,
        artist: track.artist,
        album: track.album,
        genre: 'Pop', // Default, user can change
        duration: track.duration.toString(),
        audioUrl: track.previewUrl || '', // Spotify preview (30 seconds)
        coverImage: track.albumImageUrl,
        lyrics: ''
      });
      setMessage('Song imported from Spotify! Note: Only 30-second preview available for playback.');
      setShowSpotifySearch(false);
      setSpotifyQuery('');
    } catch (error) {
      setMessage('Failed to import from Spotify');
    } finally {
      setUploadBusy((s) => ({ ...s, spotify: false }));
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-blue-800 border-b border-purple-600 px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-purple-600 p-2 rounded-lg mr-3">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Artist Studio</span>
              <p className="text-purple-200 text-sm">Create • Upload • Manage</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-purple-200">🎵 Artist</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Welcome back, {user?.firstName}! 🎵
          </h1>
          <p className="text-gray-300 text-lg">
            Your creative studio awaits • Upload, manage, and share your music with the world
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-purple-600">
            <nav className="-mb-px flex space-x-8 justify-center">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'border-purple-400 text-purple-400 bg-purple-900 bg-opacity-30'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('songs')}
                className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'songs'
                    ? 'border-purple-400 text-purple-400 bg-purple-900 bg-opacity-30'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                🎵 My Songs ({mySongs.length})
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'upload'
                    ? 'border-purple-400 text-purple-400 bg-purple-900 bg-opacity-30'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                🚀 Upload Music
              </button>
            </nav>
          </div>
        </div>

        {/* Global status message */}
        {message && (
          <div
            className={`mb-6 p-3 rounded-lg max-w-3xl mx-auto text-center ${
              message.toLowerCase().includes('success')
                ? 'bg-green-600 bg-opacity-20 border border-green-500 text-green-100'
                : 'bg-red-600 bg-opacity-20 border border-red-500 text-red-100'
            }`}
          >
            {message}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 shadow-xl border border-purple-600">
                <div className="flex items-center">
                  <div className="bg-purple-600 p-3 rounded-full mr-4">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.totalSongs}</p>
                    <p className="text-purple-200 text-sm font-medium">Total Songs</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 shadow-xl border border-green-600">
                <div className="flex items-center">
                  <div className="bg-green-600 p-3 rounded-full mr-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.totalPlays.toLocaleString()}</p>
                    <p className="text-green-200 text-sm font-medium">Total Plays</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 shadow-xl border border-blue-600">
                <div className="flex items-center">
                  <div className="bg-blue-600 p-3 rounded-full mr-4">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.totalHours}</p>
                    <p className="text-blue-200 text-sm font-medium">Hours of Music</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Songs Preview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Uploads</h2>
                <button
                  onClick={() => setActiveTab('songs')}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View All
                </button>
              </div>
              {mySongs.length > 0 ? (
                <div className="space-y-3">
                  {mySongs.slice(0, 5).map((song) => (
                    <div key={song._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                          {song.coverImage ? (
                            <img
                              src={song.coverImage}
                              alt={song.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Music className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{song.title}</h3>
                          <p className="text-sm text-gray-400">{song.artist} • {song.genre}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">{song.playCount} plays</p>
                        <p className="text-xs text-gray-400">{formatDate(song.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No songs uploaded yet</h3>
                  <p className="text-gray-400 mb-4">Upload your first song to get started</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Upload Your First Song
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'songs' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">My Songs</h2>
              <button
                onClick={() => setActiveTab('upload')}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload New Song
              </button>
            </div>

            {mySongs.length > 0 ? (
              <div className="space-y-4">
                {mySongs.map((song, index) => (
                  <div key={song._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="text-gray-400 text-sm mr-4 w-8">
                        #{index + 1}
                      </div>
                      <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                        {song.coverImage ? (
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <Music className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-lg">{song.title}</h3>
                        <p className="text-gray-400">{song.artist}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>{song.genre}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDuration(song.duration)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(song.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">{song.playCount.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">plays</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSong(song._id)}
                        disabled={deletingId === song._id}
                        className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors duration-200"
                        title="Delete song"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No songs uploaded yet</h3>
                <p className="text-gray-400 mb-6">
                  Start building your music library by uploading your first song
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Upload Your First Song
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Upload New Song</h2>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Song Title</label>
                  <input
                    type="text"
                    name="title"
                    value={uploadData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter song title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Artist Name</label>
                  <input
                    type="text"
                    name="artist"
                    value={uploadData.artist}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter artist name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Album</label>
                  <input
                    type="text"
                    name="album"
                    value={uploadData.album}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter album name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <select
                    name="genre"
                    value={uploadData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Genre</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Classical">Classical</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Electronic">Electronic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    name="duration"
                    value={uploadData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Audio URL</label>
                  <input
                    type="url"
                    name="audioUrl"
                    value={uploadData.audioUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/song.mp3"
                  />
                  
                  {/* Option 1: Upload a file */}
                  <div className="mt-2 flex items-center space-x-3 text-sm">
                    <span className="text-gray-400">Option 1: Upload file</span>
                    <input type="file" accept="audio/*" onChange={handleAudioFileSelect} />
                    {uploadBusy.audio && <span className="text-gray-400">Uploading...</span>}
                  </div>

                  {/* Option 2: Download from YouTube */}
                  <div className="mt-3 p-3 bg-gray-700 rounded-lg border border-purple-600">
                    <label className="block text-sm font-medium mb-2 text-purple-300">
                      🎬 Option 2: Download from YouTube
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Paste YouTube URL here... (e.g., https://www.youtube.com/watch?v=...)"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleYouTubeDownload}
                        disabled={uploadBusy.youtube || !youtubeUrl.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 text-sm font-medium"
                      >
                        {uploadBusy.youtube ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      🎵 Paste any YouTube URL and click Download. Audio will be extracted automatically and saved to your server!
                    </p>
                  </div>

                  {/* Option 3: Import from Spotify */}
                  <div className="mt-3 p-3 bg-gray-700 rounded-lg border border-green-600">
                    <label className="block text-sm font-medium mb-2 text-green-300">
                      🎵 Option 3: Import from Spotify
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={spotifyQuery}
                        onChange={(e) => setSpotifyQuery(e.target.value)}
                        placeholder="Search for songs on Spotify..."
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSpotifySearch()}
                      />
                      <button
                        type="button"
                        onClick={handleSpotifySearch}
                        disabled={uploadBusy.spotify || !spotifyQuery.trim()}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 text-sm font-medium"
                      >
                        {uploadBusy.spotify ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                    
                    {showSpotifySearch && spotifyResults.length > 0 && (
                      <div className="mt-3 max-h-60 overflow-y-auto border border-gray-600 rounded-lg">
                        {spotifyResults.map((track) => (
                          <div key={track.id} className="p-3 border-b border-gray-600 last:border-b-0 hover:bg-gray-600 cursor-pointer" onClick={() => handleSpotifyImport(track)}>
                            <div className="flex items-center space-x-3">
                              {track.albumImageUrl && (
                                <img src={track.albumImageUrl} alt={track.name} className="w-12 h-12 rounded object-cover" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{track.name}</p>
                                <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                                <p className="text-gray-500 text-xs truncate">{track.album}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-green-400">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
                                {track.previewUrl && <p className="text-xs text-gray-400">Preview available</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      🎶 Search and import songs from Spotify. Note: Only 30-second previews available for playback due to licensing.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                <input
                  type="url"
                  name="coverImage"
                  value={uploadData.coverImage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/cover.jpg (optional)"
                />
                <div className="mt-2 flex items-center space-x-3 text-sm">
                  <input type="file" accept="image/*" onChange={handleCoverFileSelect} />
                  {uploadBusy.cover && <span className="text-gray-400">Uploading cover...</span>}
                </div>
              </div>

              {/* NEW: Lyrics Field for Karaoke Mode */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lyrics (For Karaoke Mode) 🎤
                </label>
                <textarea
                  name="lyrics"
                  value={uploadData.lyrics}
                  onChange={handleInputChange}
                  rows="10"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  placeholder="Enter song lyrics here (line by line)&#10;&#10;[Verse 1]&#10;Your original lyrics...&#10;Each line on new line&#10;&#10;[Chorus]&#10;Main hook here...&#10;&#10;[Verse 2]&#10;Continue the story...&#10;&#10;Add as many verses as needed!"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  💡 Tip: Users will see these lyrics in Karaoke Mode when they sing along!
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors duration-200"
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Song
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-600 bg-opacity-20 border border-green-500 text-green-100'
                  : 'bg-red-600 bg-opacity-20 border border-red-500 text-red-100'
              }`}>
                {message}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtistDashboard;