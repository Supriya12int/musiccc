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

  const playRecording = async (recording) => {
    if (playingId === recording._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        try {
          console.log('🎵 Playing recording:', recording.title);
          console.log('📁 Audio URL:', recording.audioUrl);
          
          const audioUrl = `http://localhost:5000${recording.audioUrl}`;
          console.log('🔗 Full URL:', audioUrl);
          
          // Reset audio element
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          
          // Set the source
          audioRef.current.src = audioUrl;
          
          // Set volume to ensure it's audible
          audioRef.current.volume = 1.0;
          
          // Add event listeners for better debugging
          const onLoadedData = () => {
            console.log('✅ Audio data loaded successfully');
            console.log('🔊 Audio duration:', audioRef.current.duration);
            console.log('🎚️ Audio volume:', audioRef.current.volume);
          };
          
          const onError = (e) => {
            console.error('❌ Audio playback error:', e);
            console.error('Audio error details:', audioRef.current.error);
            alert(`Audio playback failed: ${audioRef.current.error?.message || 'Unknown error'}\n\nPlease check:\n1. Backend server is running\n2. Audio file exists\n3. Browser audio is not muted`);
            setPlayingId(null);
          };
          
          const onPlay = () => {
            console.log('▶️ Audio started playing');
            setPlayingId(recording._id);
            
            // Visual feedback - briefly flash the card
            const cardElement = document.querySelector(`[data-recording-id="${recording._id}"]`);
            if (cardElement) {
              cardElement.classList.add('ring-2', 'ring-purple-500');
              setTimeout(() => {
                cardElement.classList.remove('ring-2', 'ring-purple-500');
              }, 1000);
            }
          };
          
          const onPause = () => {
            console.log('⏸️ Audio paused');
          };
          
          // Add temporary event listeners
          audioRef.current.addEventListener('loadeddata', onLoadedData, { once: true });
          audioRef.current.addEventListener('error', onError, { once: true });
          audioRef.current.addEventListener('play', onPlay, { once: true });
          audioRef.current.addEventListener('pause', onPause, { once: true });
          
          // Load the audio
          audioRef.current.load();
          
          // Wait a moment for loading
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Attempt to play
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            await playPromise;
            console.log('🎉 Audio playing successfully');
            
            // Increment play count
            incrementPlayCount(recording._id);
          }
          
        } catch (error) {
          console.error('❌ Playback failed:', error);
          let errorMessage = `Failed to play recording: ${error.message}`;
          
          if (error.name === 'NotAllowedError') {
            errorMessage += '\n\nThis might be due to browser autoplay policy. Please click the play button again.';
          }
          
          alert(errorMessage);
          setPlayingId(null);
        }
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

  const testAudioAccess = async () => {
    try {
      // Test if we can access recordings endpoint
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/recordings/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🔍 Recordings endpoint status:', response.status);
      
      // Test a specific recording file
      if (recordings.length > 0) {
        const firstRecording = recordings[0];
        const testUrl = `http://localhost:5000${firstRecording.audioUrl}`;
        console.log('🧪 Testing URL:', testUrl);
        
        const testResponse = await fetch(testUrl);
        console.log('📁 File access status:', testResponse.status);
        console.log('📄 Content type:', testResponse.headers.get('content-type'));
      }
    } catch (error) {
      console.error('❌ Audio access test failed:', error);
    }
  };

  const recordings = activeTab === 'my-recordings' ? myRecordings : publicRecordings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <audio
        ref={audioRef}
        onEnded={() => {
          console.log('🏁 Audio playback ended');
          setPlayingId(null);
        }}
        onError={(e) => {
          console.error('🚨 Audio element error:', e);
          console.error('Audio error code:', e.target.error?.code);
          console.error('Audio error message:', e.target.error?.message);
        }}
        onLoadStart={() => console.log('📥 Audio load started')}
        onCanPlay={() => console.log('✅ Audio can play')}
        onPlay={() => console.log('▶️ Audio playing')}
        onPause={() => console.log('⏸️ Audio paused')}
        preload="metadata"
        controls
        style={{ display: recordings.length > 0 ? 'block' : 'none' }}
        className="mb-4 w-full max-w-md mx-auto"
      />
      
      {recordings.length > 0 && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            🔧 Debug: Use the audio controls above to test playback manually
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Karaoke Library</h1>
              <p className="text-gray-400">Listen to your recordings and discover community covers</p>
            </div>
          </div>
          
          {/* Debug Button */}
          <button
            onClick={testAudioAccess}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🔧 Test Audio
          </button>
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
              data-recording-id={recording._id}
              className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gray-700 group cursor-pointer" onClick={() => playRecording(recording)}>
                {recording.song?.albumImageUrl || recording.song?.coverImage ? (
                  <img
                    src={recording.song.albumImageUrl || recording.song.coverImage}
                    alt={recording.song.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <Music className="h-16 w-16 text-gray-500" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  {/* Play Button */}
                  <div className={`transform transition-transform duration-300 ease-out ${
                    playingId === recording._id 
                      ? 'scale-100' 
                      : 'scale-0 group-hover:scale-100'
                  }`}>
                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center shadow-2xl hover:bg-opacity-100 hover:scale-110 transition-all duration-200">
                      {playingId === recording._id ? (
                        <Pause className="h-10 w-10 text-gray-800 ml-0" />
                      ) : (
                        <Play className="h-10 w-10 text-gray-800 ml-1" />
                      )}
                    </div>
                  </div>
                  
                  {/* Pulse effect when playing */}
                  {playingId === recording._id && (
                    <div className="absolute w-20 h-20 rounded-full bg-white opacity-30 animate-ping"></div>
                  )}
                </div>

                {/* Playing Indicator */}
                {playingId === recording._id && (
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent">
                    <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-purple-600 text-white text-xs px-3 py-2 rounded-full shadow-lg animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <span className="font-medium">Now Playing</span>
                    </div>
                  </div>
                )}

                {/* Recording Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg backdrop-blur-sm bg-opacity-90">
                  <Mic className="h-3 w-3" />
                  <span>Karaoke</span>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {formatTime(recording.duration)}
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
