import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Download, 
  Trash2, 
  Music,
  Mic,
  Users,
  Clock,
  Loader
} from 'lucide-react';
import axios from 'axios';

const KaraokeLibrary = () => {
  const [activeTab, setActiveTab] = useState('my-recordings');
  const [myRecordings, setMyRecordings] = useState([]);
  const [publicRecordings, setPublicRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchRecordings();
  }, [activeTab]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'my-recordings' 
        ? 'http://localhost:5000/api/karaoke/my-recordings'
        : 'http://localhost:5000/api/karaoke/recordings/public';

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (activeTab === 'my-recordings') {
        setMyRecordings(response.data);
      } else {
        setPublicRecordings(response.data);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const playRecording = (recording) => {
    if (playingId === recording._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = `http://localhost:5000${recording.audioUrl}`;
        audioRef.current.play();
        setPlayingId(recording._id);
        
        // Increment play count
        incrementPlayCount(recording._id);
      }
    }
  };

  const incrementPlayCount = async (recordingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/karaoke/recordings/${recordingId}/play`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error incrementing play count:', error);
    }
  };

  const deleteRecording = async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/karaoke/recordings/${recordingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMyRecordings(myRecordings.filter(r => r._id !== recordingId));
      alert('Recording deleted successfully');
    } catch (error) {
      console.error('Error deleting recording:', error);
      alert('Failed to delete recording');
    }
  };

  const likeRecording = async (recordingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/karaoke/recordings/${recordingId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh recordings to get updated like count
      fetchRecordings();
    } catch (error) {
      console.error('Error liking recording:', error);
    }
  };

  const downloadRecording = async (recording) => {
    try {
      const response = await fetch(`http://localhost:5000${recording.audioUrl}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading recording:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const recordings = activeTab === 'my-recordings' ? myRecordings : publicRecordings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        className="hidden"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Karaoke Library</h1>
            <p className="text-gray-400">Listen to your recordings and discover community covers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('my-recordings')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'my-recordings'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5" />
            <span>My Recordings</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'community'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Community</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="h-12 w-12 text-purple-400 animate-spin" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-20">
          <Mic className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No recordings yet</h3>
          <p className="text-gray-500">
            {activeTab === 'my-recordings' 
              ? 'Start recording some karaoke to see them here!'
              : 'No community recordings available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((recording) => (
            <div
              key={recording._id}
              className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all transform hover:scale-105"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gray-700">
                {recording.song?.albumImageUrl || recording.song?.coverImage ? (
                  <img
                    src={recording.song.albumImageUrl || recording.song.coverImage}
                    alt={recording.song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-16 w-16 text-gray-500" />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button
                    onClick={() => playRecording(recording)}
                    className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transform scale-0 hover:scale-100 transition-transform"
                  >
                    {playingId === recording._id ? (
                      <Pause className="h-8 w-8 text-white" />
                    ) : (
                      <Play className="h-8 w-8 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Recording Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                  <Mic className="h-3 w-3" />
                  <span>Karaoke</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">
                  {recording.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2 truncate">
                  {recording.song?.title} - {recording.song?.artist}
                </p>
                
                {activeTab === 'community' && recording.user?.username && (
                  <p className="text-purple-400 text-xs mb-2">
                    by @{recording.user.username}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(recording.duration)}</span>
                  </div>
                  <span>{formatDate(recording.createdAt)}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Play className="h-3 w-3" />
                    <span>{recording.playCount || 0} plays</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{recording.likes?.length || 0} likes</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => likeRecording(recording._id)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Like</span>
                  </button>
                  
                  <button
                    onClick={() => downloadRecording(recording)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  {activeTab === 'my-recordings' && (
                    <button
                      onClick={() => deleteRecording(recording._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KaraokeLibrary;
