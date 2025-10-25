import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  X, 
  Music, 
  Volume2, 
  VolumeX,
  Save,
  Loader
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import axios from 'axios';

const KaraokeMode = ({ song, onClose }) => {
  const { audioRef, pause } = useMusic();
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const playbackRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchLyrics();
    testKaraokeAPI();
    // Pause the main player when karaoke mode opens
    if (pause) pause();
    
    return () => {
      // Cleanup
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (playbackRef.current) {
        playbackRef.current.pause();
      }
    };
  }, [song._id]);

  const testKaraokeAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Testing karaoke API connection...');
      console.log('Token available:', !!token);
      
      if (!token) {
        console.error('No authentication token found!');
        alert('Please log in again. Authentication token is missing.');
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/karaoke/test',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Karaoke API test successful:', response.data);
    } catch (error) {
      console.error('Karaoke API test failed:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('This may affect recording save functionality');
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      }
    }
  };

  const fetchLyrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/lyrics/song/${song._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        let lyricsContent = '';
        
        // Handle structured lyrics
        if (response.data.lyrics && typeof response.data.lyrics === 'string' && response.data.lyrics.trim()) {
          try {
            const parsedLyrics = JSON.parse(response.data.lyrics);
            if (parsedLyrics.displayText) {
              lyricsContent = String(parsedLyrics.displayText);
            } else if (parsedLyrics.structure) {
              // Format structured lyrics for display
              lyricsContent = parsedLyrics.structure
                .map(section => {
                  const sectionHeader = section.type === 'verse' ? 
                    `[Verse ${section.number || ''}]` : 
                    `[${section.type.charAt(0).toUpperCase() + section.type.slice(1)}]`;
                  
                  const sectionLines = section.lines.map(line => 
                    typeof line === 'string' ? line : line.text
                  ).join('\n');
                  
                  return `${sectionHeader}\n${sectionLines}`;
                })
                .join('\n\n');
            } else {
              lyricsContent = String(response.data.lyrics);
            }
          } catch (parseError) {
            // If parsing fails, treat as plain text
            lyricsContent = String(response.data.lyrics);
          }
        } else {
          lyricsContent = 'Lyrics not available for this song. 🎵';
        }
        
        setLyrics(lyricsContent);
      } else {
        setLyrics('Lyrics not available for this song. 🎵');
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLyrics('Lyrics not available for this song. 🎵\n\nTo add lyrics:\n1. Use licensed lyrics APIs\n2. Add your own original lyrics\n3. Use public domain songs');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please grant permission and try again.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playRecording = () => {
    if (recordedUrl && playbackRef.current) {
      playbackRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (playbackRef.current) {
      playbackRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title}-karaoke-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const saveRecording = async () => {
    if (!recordedBlob) {
      alert('No recording to save. Please record something first.');
      return;
    }

    try {
      setUploading(true);
      console.log('Starting to save recording...');
      console.log('Recording blob size:', recordedBlob.size);
      console.log('Recording blob type:', recordedBlob.type);
      console.log('Recording duration:', recordingTime);
      console.log('Song ID:', song._id);

      const formData = new FormData();
      formData.append('audio', recordedBlob, `karaoke-${song.title}-${Date.now()}.webm`);
      formData.append('songId', song._id);
      formData.append('title', `${song.title} - Karaoke Cover`);
      formData.append('duration', recordingTime.toString());
      formData.append('isPublic', 'true');

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'audio') {
          console.log(`  ${key}: Blob (${value.size} bytes, type: ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      console.log('Sending request to save recording...');
      const response = await axios.post(
        'http://localhost:5000/api/karaoke/recordings',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('Recording saved successfully:', response.data);
      
      // Show success message with details
      const recording = response.data.recording;
      const successMessage = `🎉 Recording saved successfully!\n\n` +
        `Title: ${recording.title}\n` +
        `Duration: ${formatTime(recordingTime)}\n` +
        `You can find it in your Karaoke Library.`;
      
      alert(successMessage);
      
      // Clear the recording
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecordingTime(0);

    } catch (error) {
      console.error('Error saving recording:', error);
      
      let errorMessage = 'Failed to save recording. ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.response) {
        // Server responded with error status
        console.error('Server response:', error.response.data);
        errorMessage += error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage += error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-black w-full h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden">
              {song.albumImageUrl || song.coverImage ? (
                <img
                  src={song.albumImageUrl || song.coverImage}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{song.title}</h2>
              <p className="text-gray-400">{song.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
          {/* Lyrics Panel */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <Music className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Lyrics</h3>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader className="h-8 w-8 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Enhanced Lyrics Display */}
                    <div className="text-white">
                      {(lyrics && typeof lyrics === 'string' ? lyrics : 'Lyrics not available for this song. 🎵').split('\n\n').map((section, sectionIndex) => {
                        const lines = section.split('\n');
                        const isHeader = lines[0].startsWith('[') && lines[0].endsWith(']');
                        
                        return (
                          <div key={sectionIndex} className="mb-10">
                            {isHeader && (
                              <div className="mb-6 text-center">
                                <span className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-bold uppercase tracking-wide shadow-lg animate-pulse">
                                  {lines[0].replace(/[\[\]]/g, '')}
                                </span>
                              </div>
                            )}
                            <div className="space-y-4">
                              {(isHeader ? lines.slice(1) : lines).map((line, lineIndex) => (
                                line.trim() && (
                                  <div 
                                    key={lineIndex}
                                    className="group relative overflow-hidden"
                                  >
                                    {/* Background Highlight Animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                    
                                    {/* Lyric Line */}
                                    <div 
                                      className="relative text-xl leading-relaxed font-light text-center p-4 rounded-xl border-2 border-transparent hover:border-purple-400/30 transition-all duration-300 cursor-pointer bg-gray-800/40 backdrop-blur-sm hover:bg-purple-900/30 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
                                      onClick={() => {
                                        // Add click animation
                                        const element = document.getElementById(`lyric-${sectionIndex}-${lineIndex}`);
                                        if (element) {
                                          element.classList.add('animate-bounce');
                                          setTimeout(() => element.classList.remove('animate-bounce'), 600);
                                        }
                                      }}
                                      id={`lyric-${sectionIndex}-${lineIndex}`}
                                    >
                                      {/* Sparkle Effects */}
                                      <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200"></div>
                                      
                                      {/* Main Text with Gradient Effect */}
                                      <span className="relative z-10 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent font-medium">
                                        {line}
                                      </span>
                                      
                                      {/* Microphone Icon for Emphasis */}
                                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                                        <Mic className="h-4 w-4 text-purple-400" />
                                      </div>
                                    </div>

                                    {/* Singing Indicator */}
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Singing Tips Overlay */}
                      <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                        <h4 className="text-lg font-bold text-purple-300 mb-4 flex items-center">
                          <Music className="h-5 w-5 mr-2" />
                          🎤 Karaoke Pro Tips
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong className="text-purple-300">Click any line</strong> to highlight and focus on that part
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong className="text-pink-300">Watch the sparkles</strong> when you hover over lyrics
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong className="text-blue-300">Record while singing</strong> to capture your performance
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong className="text-green-300">Use headphones</strong> for the best audio experience
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Legal Notice */}
                    <div className="mt-8 pt-6 border-t border-gray-600">
                      <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
                        <p className="text-yellow-300 text-sm">
                          <strong>Note:</strong> These are sample lyrics for demonstration. 
                          For production use, please ensure you have proper licensing for song lyrics.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recording Panel */}
          <div className="lg:w-96 bg-gray-900 bg-opacity-80 p-6 border-l border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Recording Studio</h3>

            {/* Recording Controls */}
            <div className="space-y-6">
              {/* Status Indicator */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Status</span>
                  <div className="flex items-center space-x-2">
                    {isRecording && (
                      <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`}></div>
                    )}
                    <span className="text-white text-sm font-medium">
                      {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
                    </span>
                  </div>
                </div>
                
                {isRecording && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                )}
              </div>

              {/* Record Button */}
              {!isRecording && !recordedUrl && (
                <button
                  onClick={startRecording}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold text-lg transition-all transform hover:scale-105"
                >
                  <Mic className="h-6 w-6" />
                  <span>Start Recording</span>
                </button>
              )}

              {/* Recording Actions */}
              {isRecording && (
                <div className="space-y-3">
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                    >
                      <Pause className="h-5 w-5" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                    >
                      <Play className="h-5 w-5" />
                      <span>Resume</span>
                    </button>
                  )}
                  
                  <button
                    onClick={stopRecording}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                  >
                    <Square className="h-5 w-5" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}

              {/* Playback Controls */}
              {recordedUrl && (
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Your Recording</span>
                      <span className="text-purple-400 text-sm">{formatTime(recordingTime)}</span>
                    </div>
                    
                    <audio
                      ref={playbackRef}
                      src={recordedUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    
                    <div className="flex items-center space-x-3">
                      {!isPlaying ? (
                        <button
                          onClick={playRecording}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                        >
                          <Play className="h-5 w-5" />
                          <span>Play</span>
                        </button>
                      ) : (
                        <button
                          onClick={pausePlayback}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                        >
                          <Pause className="h-5 w-5" />
                          <span>Pause</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Save and Share Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={saveRecording}
                      disabled={uploading || !recordedBlob}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save to Library</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={downloadRecording}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setRecordedBlob(null);
                      setRecordedUrl(null);
                      setRecordingTime(0);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                  >
                    <Mic className="h-5 w-5" />
                    <span>Record Again</span>
                  </button>
                </div>
              )}

              {/* Recording Status */}
              {recordedUrl && (
                <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 mt-4 border border-green-500/20">
                  <h4 className="text-green-300 font-semibold mb-2 text-sm flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Recording Ready!
                  </h4>
                  <p className="text-gray-300 text-xs">
                    Your {formatTime(recordingTime)} recording is ready to save to your Karaoke Library or download to your device.
                  </p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 mt-6">
                <h4 className="text-purple-300 font-semibold mb-2 text-sm">Tips for Better Karaoke:</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Use headphones to avoid feedback</li>
                  <li>• Find a quiet environment</li>
                  <li>• Sing along with the lyrics</li>
                  <li>• Save recordings to build your collection</li>
                  <li>• Have fun and be creative!</li>
                </ul>
              </div>

              {/* Troubleshooting */}
              {!navigator.mediaDevices && (
                <div className="bg-red-900 bg-opacity-30 rounded-lg p-4 mt-4 border border-red-500/20">
                  <h4 className="text-red-300 font-semibold mb-2 text-sm">⚠️ Microphone Not Available</h4>
                  <p className="text-gray-300 text-xs">
                    Please ensure you're using HTTPS or localhost and grant microphone permissions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaraokeMode;
