import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { musicAPI, spotifyAPI } from '../services/api';
import { Upload, Music, Youtube, Headphones, ArrowLeft, Check, AlertCircle, Plus, LogOut, BarChart3 } from 'lucide-react';

const ArtistUpload = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
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
  const [uploadBusy, setUploadBusy] = useState({ 
    audio: false, 
    cover: false, 
    youtube: false, 
    spotify: false 
  });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual', 'file', 'youtube', 'spotify'

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
      setMessage('🎉 Song uploaded successfully! Your music is now live.');
      
      // Reset form
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
      setYoutubeUrl('');
      setSpotifyQuery('');
      setSpotifyResults([]);
      setShowSpotifySearch(false);
      setUploadMethod('manual');
      
      // Auto redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/artist/dashboard');
      }, 2000);
      
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Failed to upload song'));
    } finally {
      setUploading(false);
    }
  };

  const handleAudioFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadBusy(prev => ({ ...prev, audio: true }));
    setMessage('');
    
    try {
      const { data } = await musicAPI.uploadAudio(file);
      setUploadData(prev => ({ ...prev, audioUrl: data.url }));
      setMessage('✅ Audio file uploaded successfully!');
    } catch (error) {
      setMessage('❌ Failed to upload audio: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUploadBusy(prev => ({ ...prev, audio: false }));
    }
  };

  const handleCoverFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadBusy(prev => ({ ...prev, cover: true }));
    setMessage('');
    
    try {
      const { data } = await musicAPI.uploadCover(file);
      setUploadData(prev => ({ ...prev, coverImage: data.url }));
      setMessage('✅ Cover image uploaded successfully!');
    } catch (error) {
      setMessage('❌ Failed to upload cover: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setUploadBusy(prev => ({ ...prev, cover: false }));
    }
  };

  const handleYouTubeDownload = async () => {
    if (!youtubeUrl.trim()) {
      setMessage('❌ Please enter a valid YouTube URL');
      return;
    }
    
    setUploadBusy(prev => ({ ...prev, youtube: true }));
    setMessage('');
    
    try {
      const { data } = await musicAPI.downloadFromYouTube(youtubeUrl);
      setUploadData(prev => ({
        ...prev,
        audioUrl: data.url,
        title: prev.title || data.title,
        duration: prev.duration || data.duration,
        coverImage: prev.coverImage || data.thumbnail
      }));
      setMessage('✅ Audio downloaded from YouTube! Fields auto-filled.');
      setYoutubeUrl('');
    } catch (error) {
      setMessage('❌ YouTube download failed: ' + (error.response?.data?.message || 'Invalid URL or video not available'));
    } finally {
      setUploadBusy(prev => ({ ...prev, youtube: false }));
    }
  };

  const handleSpotifySearch = async () => {
    if (!spotifyQuery.trim()) {
      setMessage('❌ Please enter a search query');
      return;
    }
    
    setUploadBusy(prev => ({ ...prev, spotify: true }));
    setMessage('');
    
    try {
      const { data } = await spotifyAPI.search(spotifyQuery);
      setSpotifyResults(data.tracks || []);
      setShowSpotifySearch(true);
      setMessage(`🎵 Found ${data.tracks?.length || 0} songs on Spotify`);
    } catch (error) {
      setMessage('❌ Spotify search failed: ' + (error.response?.data?.message || 'Service unavailable'));
    } finally {
      setUploadBusy(prev => ({ ...prev, spotify: false }));
    }
  };

  const handleSpotifyImport = async (track) => {
    setUploadData({
      title: track.name,
      artist: track.artist,
      album: track.album,
      genre: 'Pop',
      duration: track.duration.toString(),
      audioUrl: track.previewUrl || '',
      coverImage: track.albumImageUrl,
      lyrics: ''
    });
    setMessage('✅ Song imported from Spotify! Note: Only 30-second preview available.');
    setShowSpotifySearch(false);
    setSpotifyQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-blue-800 border-b border-purple-600 px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/artist/dashboard')}
              className="mr-4 p-2 hover:bg-purple-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="bg-purple-600 p-2 rounded-lg mr-3">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Upload Your Music</h1>
                <p className="text-purple-200 text-sm">Share your art with the world</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/artist/dashboard')}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors duration-200"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-purple-200">{user?.role === 'admin' ? '👑 Admin' : '🎵 Artist'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Ready to Upload? 🚀
          </h2>
          <p className="text-gray-300 text-lg">
            Choose your preferred method and let's get your music out there!
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('❌') 
              ? 'bg-red-900/20 border-red-500 text-red-200'
              : message.includes('✅') || message.includes('🎉')
              ? 'bg-green-900/20 border-green-500 text-green-200'
              : 'bg-blue-900/20 border-blue-500 text-blue-200'
          }`}>
            <div className="flex items-center">
              {message.includes('❌') ? (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <Check className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              {message}
            </div>
          </div>
        )}

        {/* Upload Method Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setUploadMethod('manual')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              uploadMethod === 'manual'
                ? 'border-purple-500 bg-purple-900/30'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
            }`}
          >
            <Plus className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <h3 className="font-medium">Manual Entry</h3>
            <p className="text-sm text-gray-400">Enter details manually</p>
          </button>

          <button
            onClick={() => setUploadMethod('file')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              uploadMethod === 'file'
                ? 'border-blue-500 bg-blue-900/30'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
            }`}
          >
            <Music className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <h3 className="font-medium">Upload Files</h3>
            <p className="text-sm text-gray-400">Audio & cover files</p>
          </button>

          <button
            onClick={() => setUploadMethod('youtube')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              uploadMethod === 'youtube'
                ? 'border-red-500 bg-red-900/30'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
            }`}
          >
            <Youtube className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <h3 className="font-medium">From YouTube</h3>
            <p className="text-sm text-gray-400">Extract from video</p>
          </button>

          <button
            onClick={() => setUploadMethod('spotify')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              uploadMethod === 'spotify'
                ? 'border-green-500 bg-green-900/30'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
            }`}
          >
            <Headphones className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <h3 className="font-medium">From Spotify</h3>
            <p className="text-sm text-gray-400">Import metadata</p>
          </button>
        </div>

        {/* Upload Method Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {/* YouTube Method */}
          {uploadMethod === 'youtube' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
                <Youtube className="h-5 w-5 mr-2" />
                Download from YouTube
              </h3>
              <div className="flex space-x-3">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
                />
                <button
                  onClick={handleYouTubeDownload}
                  disabled={uploadBusy.youtube || !youtubeUrl.trim()}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  {uploadBusy.youtube ? 'Downloading...' : 'Download'}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                🎵 Audio will be extracted and form fields auto-filled
              </p>
            </div>
          )}

          {/* Spotify Method */}
          {uploadMethod === 'spotify' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400 flex items-center">
                <Headphones className="h-5 w-5 mr-2" />
                Import from Spotify
              </h3>
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  value={spotifyQuery}
                  onChange={(e) => setSpotifyQuery(e.target.value)}
                  placeholder="Search for songs (e.g., 'Bohemian Rhapsody Queen')"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSpotifySearch()}
                />
                <button
                  onClick={handleSpotifySearch}
                  disabled={uploadBusy.spotify || !spotifyQuery.trim()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  {uploadBusy.spotify ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {showSpotifySearch && spotifyResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-gray-600 rounded-lg bg-gray-900">
                  {spotifyResults.map((track) => (
                    <div 
                      key={track.id} 
                      onClick={() => handleSpotifyImport(track)}
                      className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-gray-400 mt-2">
                🎶 Click any song to import its metadata (30s preview only)
              </p>
            </div>
          )}

          {/* Main Upload Form */}
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Song Title *</label>
                <input
                  type="text"
                  name="title"
                  value={uploadData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  placeholder="Enter your song title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Artist Name *</label>
                <input
                  type="text"
                  name="artist"
                  value={uploadData.artist}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  placeholder="Your artist/band name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Album</label>
                <input
                  type="text"
                  name="album"
                  value={uploadData.album}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  placeholder="Album name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Genre *</label>
                <select
                  name="genre"
                  value={uploadData.genre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="">Select Genre</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Classical">Classical</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Country">Country</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Duration (seconds) *</label>
                <input
                  type="number"
                  name="duration"
                  value={uploadData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="3600"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  placeholder="e.g., 180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Audio URL *</label>
                <input
                  type="url"
                  name="audioUrl"
                  value={uploadData.audioUrl}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  placeholder="https://example.com/your-song.mp3"
                />
                
                {uploadMethod === 'file' && (
                  <div className="mt-3 flex items-center space-x-3">
                    <input 
                      type="file" 
                      accept="audio/*" 
                      onChange={handleAudioFileSelect}
                      className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                    {uploadBusy.audio && <span className="text-gray-400 text-sm">Uploading...</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Cover Image URL</label>
              <input
                type="url"
                name="coverImage"
                value={uploadData.coverImage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                placeholder="https://example.com/cover.jpg (optional)"
              />
              
              {uploadMethod === 'file' && (
                <div className="mt-3 flex items-center space-x-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverFileSelect}
                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {uploadBusy.cover && <span className="text-gray-400 text-sm">Uploading...</span>}
                </div>
              )}
            </div>

            {/* Lyrics */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Lyrics (For Karaoke Mode) 🎤
              </label>
              <textarea
                name="lyrics"
                value={uploadData.lyrics}
                onChange={handleInputChange}
                rows="8"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 font-mono text-sm"
                placeholder="[Verse 1]&#10;Your amazing lyrics here...&#10;Line by line&#10;&#10;[Chorus]&#10;The catchy part everyone sings along&#10;&#10;[Verse 2]&#10;Continue your story...&#10;&#10;Add more verses as needed!"
              />
              <p className="text-sm text-gray-400 mt-2">
                💡 Add lyrics so fans can sing along in Karaoke Mode!
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Uploading Your Music...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-3" />
                  🚀 Upload & Publish Song
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ArtistUpload;