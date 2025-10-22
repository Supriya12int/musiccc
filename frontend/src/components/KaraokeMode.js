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
        if (response.data.lyrics) {
          try {
            const parsedLyrics = JSON.parse(response.data.lyrics);
            if (parsedLyrics.displayText) {
              lyricsContent = parsedLyrics.displayText;
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
              lyricsContent = response.data.lyrics;
            }
          } catch (parseError) {
            // If parsing fails, treat as plain text
            lyricsContent = response.data.lyrics;
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
    if (!recordedBlob) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('audio', recordedBlob, `karaoke-${Date.now()}.webm`);
      formData.append('songId', song._id);
      formData.append('title', `${song.title} - Karaoke Cover`);
      formData.append('duration', recordingTime);
      formData.append('isPublic', 'true');

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/karaoke/recordings',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Recording saved successfully! You can find it in your Karaoke Library.');
      setRecordedBlob(null);
      setRecordedUrl(null);
    } catch (error) {
      console.error('Error saving recording:', error);
      alert('Failed to save recording. Please try again.');
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
                    {/* Formatted Lyrics Display */}
                    <div className="text-white">
                      {lyrics.split('\n\n').map((section, sectionIndex) => {
                        const lines = section.split('\n');
                        const isHeader = lines[0].startsWith('[') && lines[0].endsWith(']');
                        
                        return (
                          <div key={sectionIndex} className="mb-8">
                            {isHeader && (
                              <div className="mb-4">
                                <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                                  {lines[0].replace(/[\[\]]/g, '')}
                                </span>
                              </div>
                            )}
                            <div className="space-y-3">
                              {(isHeader ? lines.slice(1) : lines).map((line, lineIndex) => (
                                line.trim() && (
                                  <div 
                                    key={lineIndex}
                                    className="text-lg leading-relaxed font-light hover:text-purple-300 transition-colors duration-300 cursor-pointer p-2 rounded-lg hover:bg-purple-900 hover:bg-opacity-20"
                                  >
                                    {line}
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        );
                      })}
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
                      disabled={uploading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors"
                    >
                      {uploading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save</span>
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

              {/* Tips */}
              <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 mt-6">
                <h4 className="text-purple-300 font-semibold mb-2 text-sm">Tips for Better Karaoke:</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Use headphones to avoid feedback</li>
                  <li>• Find a quiet environment</li>
                  <li>• Sing along with the lyrics</li>
                  <li>• Have fun and be creative!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KaraokeMode;
