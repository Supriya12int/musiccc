import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { musicAPI, playlistsAPI, libraryAPI, usersAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MusicPlayer from '../components/MusicPlayer';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import PlaylistModal from '../components/PlaylistModal';
import BrowseArtists from '../components/BrowseArtists';
import FollowedArtists from '../components/FollowedArtists';
import ArtistPage from '../components/ArtistPage';
import Events from '../components/Events';
import KaraokeMode from '../components/KaraokeMode';
import KaraokeLibrary from './KaraokeLibrary';
import ProfileSettings from '../components/ProfileSettings';
import Settings from '../components/Settings';
import { Play, Pause, Clock, Heart, Music, List, Search, ChevronDown, MoreHorizontal, Mic, Plus, ListPlus } from 'lucide-react';

// Song Row Component with 3-dots menu
const SongRow = ({ song, index, onPlay, onKaraoke, isCurrentSong, isPlaying }) => {
  const { playNext } = useMusic();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    onPlay();
  };

  const handleMenuOption = async (e, option) => {
    e.stopPropagation();
    setShowMenu(false);
    
    switch(option) {
      case 'playnext':
        playNext(song);
        break;
      case 'karaoke':
        onKaraoke();
        break;
      case 'playlist':
        // Pass the song to the parent component to handle playlist modal
        if (window.openPlaylistModal) {
          window.openPlaylistModal(song);
        }
        break;
      case 'favorite':
        try {
          await usersAPI.addToFavorites(song._id);
          alert('Song added to favorites!');
        } catch (error) {
          if (error.response?.data?.message === 'Song already in favorites') {
            alert('Song is already in your favorites!');
          } else {
            alert('Failed to add song to favorites. Please try again.');
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 cursor-pointer transition-colors duration-200 items-center border-b border-gray-700 last:border-b-0 group"
    >
      <div className="col-span-1 text-gray-400 font-mono">
        {index + 1}
      </div>
      
      <div className="col-span-5 flex items-center">
        <div 
          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 relative cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handlePlayClick}
        >
          {song.coverImage ? (
            <img 
              src={song.coverImage} 
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <Music className="h-6 w-6 text-white" />
          )}
          
          {/* Play/Pause Overlay */}
          <div className={`absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center transition-opacity duration-200 ${
            isHovered || isCurrentSong ? 'opacity-100' : 'opacity-0'
          }`}>
            {isCurrentSong && isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white" />
            )}
          </div>
        </div>
        <div>
          <div className="font-medium text-white truncate">{song.title}</div>
          <div className="text-sm text-gray-400">{song.playCount} plays</div>
        </div>
      </div>
      
      <div className="col-span-4 text-gray-300 truncate">{song.artist}</div>
      <div className="col-span-2 flex items-center justify-between">
        <span className="text-gray-400 truncate">{song.album || 'Single'}</span>
        
        {/* 3-Dots Menu */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-full hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[160px]">
              <div className="py-1">
                <button
                  onClick={(e) => handleMenuOption(e, 'playnext')}
                  className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  <ListPlus className="h-4 w-4 mr-3" />
                  Play Next
                </button>
                <button
                  onClick={(e) => handleMenuOption(e, 'karaoke')}
                  className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  <Mic className="h-4 w-4 mr-3" />
                  Karaoke Mode
                </button>
                <button
                  onClick={(e) => handleMenuOption(e, 'playlist')}
                  className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Add to Playlist
                </button>
                <button
                  onClick={(e) => handleMenuOption(e, 'favorite')}
                  className="w-full flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  <Heart className="h-4 w-4 mr-3" />
                  Add to Favorites
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { playSong, recentlyPlayed, currentSong, isPlaying, togglePlayPause } = useMusic();
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [librarySongs, setLibrarySongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [karaokeMode, setKaraokeMode] = useState(false);
  const [selectedKaraokeSong, setSelectedKaraokeSong] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryView, setCategoryView] = useState('categories'); // 'categories' or 'songs'
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'library') {
      loadLibrarySongs();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [songsRes, playlistsRes, popularRes] = await Promise.all([
        musicAPI.getSongs({ limit: 1000 }), // Increased limit to get all songs
        playlistsAPI.getUserPlaylists(),
        musicAPI.getPopularSongs(10)
      ]);

      console.log('Dashboard - Loaded songs:', songsRes.data.songs);
      console.log('Dashboard - Hindi songs:', songsRes.data.songs.filter(s => s.genre === 'Hindi'));
      console.log('Dashboard - Telugu songs:', songsRes.data.songs.filter(s => s.genre === 'Telugu'));

      setSongs(songsRes.data.songs);
      setPlaylists(playlistsRes.data);
      setPopularSongs(popularRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLibrarySongs = async () => {
    try {
      const response = await libraryAPI.getUserLibrary();
      setLibrarySongs(response.data);
    } catch (error) {
      console.error('Error loading library songs:', error);
      setLibrarySongs([]);
    }
  };

  const handlePlaySong = (song, songList = songs) => {
    if (currentSong && currentSong._id === song._id) {
      togglePlayPause();
    } else {
      const songIndex = songList.findIndex(s => s._id === song._id);
      playSong(song, songList, songIndex);
    }
  };

  const openPlaylistModal = (song) => {
    setSelectedSongForPlaylist(song);
    setPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setPlaylistModalOpen(false);
    setSelectedSongForPlaylist(null);
  };

  const handlePlaylistSuccess = () => {
    // Optionally refresh playlists data
    loadDashboardData();
  };

  // Make the function available globally for SongRow component
  React.useEffect(() => {
    window.openPlaylistModal = openPlaylistModal;
    return () => {
      delete window.openPlaylistModal;
    };
  }, []);

  // Dynamic greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Start your day with some great music.";
    if (hour < 17) return "Keep the energy going with your favorite tracks.";
    if (hour < 21) return "Unwind with some beautiful melodies.";
    return "Relax and enjoy some soothing tunes.";
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setActiveTab('discover');
      return;
    }

    setActiveTab('search');

    try {
      // Search in existing songs
      const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filteredSongs);
    } catch (error) {
      console.error('Error searching songs:', error);
      setSearchResults([]);
    }
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setActiveTab('artist-page');
  };

  const handleBackToArtists = () => {
    setSelectedArtist(null);
    setActiveTab('artists');
  };

  const handleKaraokeOpen = (song) => {
    setSelectedKaraokeSong(song);
    setKaraokeMode(true);
  };

  const handleKaraokeClose = () => {
    setKaraokeMode(false);
    setSelectedKaraokeSong(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCategoryView('songs');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryView('categories');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading your music library...</div>
          <div className="text-slate-400 text-sm mt-2">Please wait while we prepare your experience</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <TopBar onSearch={handleSearch} />

          {/* Dashboard Content */}
          <main className="flex-1 p-6 pb-32 overflow-y-auto">
            {/* Enhanced Welcome Section */}
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-slate-800/50 p-8 border border-slate-700/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-500/5 to-indigo-600/5"></div>
              <div className="absolute top-8 right-8 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-purple-500/10 rounded-full blur-lg"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-2 text-white">
                      {getTimeBasedGreeting()}!
                    </h1>
                    <p className="text-lg text-slate-300">
                      {getGreetingMessage()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400 mb-1">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-lg font-semibold text-slate-200">
                      {new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Music className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-white">Your Music</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Extensive Collection</p>
                    <p className="text-slate-300 text-xs">Access thousands of tracks across multiple genres and languages</p>
                  </div>
                  
                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-white">Listening History</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Always Available</p>
                    <p className="text-slate-300 text-xs">Track your musical journey and discover patterns in your taste</p>
                  </div>
                  
                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                        <Mic className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="font-semibold text-white">Karaoke Studio</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Professional Experience</p>
                    <p className="text-slate-300 text-xs">High-quality karaoke with lyrics and recording capabilities</p>
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'discover' && (
              <>
                {categoryView === 'categories' ? (
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <div className="flex items-center mb-2">
                          <Music className="h-6 w-6 text-blue-400 mr-3" />
                          <h2 className="text-3xl font-bold text-white">Music Categories</h2>
                        </div>
                        <p className="text-slate-400">Explore curated collections across genres and languages</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 mb-1">Featured Collections</p>
                        <p className="text-lg font-semibold text-slate-300">5 Categories</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl">
                          {/* Hindi Category Box */}
                          <div
                            onClick={() => handleCategoryClick('Hindi')}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-400/80 to-rose-500/80 p-4 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-red-500/15 aspect-square">
                              {/* Background Elements */}
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
                              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/5 rounded-full blur-md"></div>
                              
                              <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Music className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">Ready</div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg font-bold mb-1">Hindi</h3>
                                  <p className="text-sm opacity-90">Bollywood Hits</p>
                                </div>
                                
                                <div className="mt-auto">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Play className="h-3 w-3 ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Telugu Category Box */}
                          <div
                            onClick={() => handleCategoryClick('Telugu')}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-400/80 to-indigo-500/80 p-4 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-500/15 aspect-square">
                              {/* Background Elements */}
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
                              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/5 rounded-full blur-md"></div>
                              
                              <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Music className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">Ready</div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg font-bold mb-1">Telugu</h3>
                                  <p className="text-sm opacity-90">Tollywood Hits</p>
                                </div>
                                
                                <div className="mt-auto">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Play className="h-3 w-3 ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Additional quick access categories */}
                          <div
                            onClick={() => handleSearch('Popular')}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-400/80 to-pink-400/80 p-4 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-500/15 aspect-square">
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
                              
                              <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Heart className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">Hot</div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg font-bold mb-1">Popular</h3>
                                  <p className="text-sm opacity-90">Trending Now</p>
                                </div>
                                
                                <div className="mt-auto">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Play className="h-3 w-3 ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            onClick={() => handleSearch('Romance')}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-400/80 to-red-400/80 p-4 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-rose-500/15 aspect-square">
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
                              
                              <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Heart className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">Love</div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg font-bold mb-1">Romance</h3>
                                  <p className="text-sm opacity-90">Love Songs</p>
                                </div>
                                
                                <div className="mt-auto">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Play className="h-3 w-3 ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            onClick={() => setActiveTab('karaoke-library')}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400/80 to-emerald-500/80 p-4 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-green-500/15 aspect-square">
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
                              
                              <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Mic className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">Sing</div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg font-bold mb-1">Karaoke</h3>
                                  <p className="text-sm opacity-90">Sing Along</p>
                                </div>
                                
                                <div className="mt-auto">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Mic className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Podcast Category Box */}
                          <div
                            onClick={() => handleCategoryClick('Podcast')}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-400/80 to-yellow-500/80 p-4 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-orange-500/15 aspect-square">
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
                              
                              <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <Mic className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">Talk</div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg font-bold mb-1">Podcasts</h3>
                                  <p className="text-sm opacity-90">Listen & Learn</p>
                                </div>
                                
                                <div className="mt-auto">
                                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                                    <Play className="h-3 w-3 ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                    </div>
                  </section>
                ) : (
                  /* Songs List View */
                  <section className="mb-8">
                    <div className="flex items-center mb-6">
                      <button 
                        onClick={handleBackToCategories}
                        className="mr-4 p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
                      >
                        <ChevronDown className="h-6 w-6 text-purple-400 rotate-90" />
                      </button>
                      <h2 className="text-2xl font-bold">{selectedCategory} Songs</h2>
                    </div>

                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-700">
                        <div className="grid grid-cols-12 gap-4 text-sm text-gray-400 font-medium">
                          <div className="col-span-1">#</div>
                          <div className="col-span-5">Title</div>
                          <div className="col-span-4">Artist</div>
                          <div className="col-span-2">Album</div>
                        </div>
                      </div>
                      
                      {songs
                        .filter(song => song.genre === selectedCategory)
                        .map((song, index) => (
                          <SongRow 
                            key={song._id}
                            song={song}
                            index={index}
                            onPlay={() => handlePlaySong(song, songs.filter(s => s.genre === selectedCategory))}
                            onKaraoke={() => handleKaraokeOpen(song)}
                            isCurrentSong={currentSong && currentSong._id === song._id}
                            isPlaying={isPlaying}
                          />
                        ))
                      }
                    </div>
                  </section>
                )}

                {/* Recently Played - Only show if user has played songs and on categories view */}
                {recentlyPlayed.length > 0 && categoryView === 'categories' && (
                  <div className="px-8 pb-16">
                    <div className="max-w-6xl mx-auto">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
                          <Clock className="h-8 w-8 text-green-400 mr-3" />
                          Recently Played
                        </h3>
                        <p className="text-lg text-gray-300">Pick up where you left off</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recentlyPlayed.slice(0, 4).map((song) => (
                          <SongCard
                            key={`recent-${song._id}`}
                            song={song}
                            onPlay={() => handlePlaySong(song, recentlyPlayed)}
                            onKaraoke={handleKaraokeOpen}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'search' && (
              <section>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <Search className="h-8 w-8 text-purple-400 mr-3" />
                    <h1 className="text-3xl font-bold">Search Results</h1>
                  </div>
                  {searchQuery && (
                    <p className="text-gray-400">
                      {searchResults.length > 0 
                        ? `Found ${searchResults.length} results for "${searchQuery}"`
                        : `No results found for "${searchQuery}"`
                      }
                    </p>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.map((song) => (
                      <SongCard
                        key={song._id}
                        song={song}
                        onPlay={() => handlePlaySong(song, searchResults)}
                        onKaraoke={handleKaraokeOpen}
                      />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-16">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-gray-400 mb-4">
                      Try searching for different keywords or browse our music collection
                    </p>
                    <button 
                      onClick={() => setActiveTab('discover')}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      Browse Music
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Quick Search Suggestions */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-300">Try searching for:</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Arijit Singh', 'Apna Bana Le', 'Telugu Songs', 'Bollywood', 'Love Songs', 'Sid Sriram'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSearch(suggestion)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm text-gray-300 hover:text-white transition-colors duration-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular Songs */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-300">Popular Songs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {popularSongs.slice(0, 4).map((song) => (
                          <SongCard
                            key={song._id}
                            song={song}
                            onPlay={() => handlePlaySong(song, popularSongs)}
                            onKaraoke={handleKaraokeOpen}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Browse by Genre */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-300">Browse by Genre</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Hindi', color: 'bg-red-600', songs: songs.filter(s => s.genre === 'Hindi').length },
                          { name: 'Telugu', color: 'bg-blue-600', songs: songs.filter(s => s.genre === 'Telugu').length },
                          { name: 'Podcast', color: 'bg-orange-600', songs: songs.filter(s => s.genre === 'Podcast').length },
                          { name: 'Romance', color: 'bg-pink-600', songs: songs.filter(s => s.title.toLowerCase().includes('love') || s.title.toLowerCase().includes('pyar')).length },
                          { name: 'Popular', color: 'bg-purple-600', songs: popularSongs.length }
                        ].map((genre) => (
                          <button
                            key={genre.name}
                            onClick={() => handleSearch(genre.name)}
                            className={`${genre.color} hover:opacity-80 rounded-lg p-4 text-left transition-opacity duration-200`}
                          >
                            <h4 className="font-semibold text-white">{genre.name}</h4>
                            <p className="text-sm text-gray-200">{genre.songs} songs</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'events' && (
              <Events />
            )}

            {activeTab === 'karaoke-library' && <KaraokeLibrary />}

            {activeTab === 'recently-played' && (
              <section>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-8 w-8 text-green-400 mr-3" />
                    <h1 className="text-3xl font-bold">Recently Played</h1>
                  </div>
                  <p className="text-gray-400">
                    {recentlyPlayed.length > 0 
                      ? `${recentlyPlayed.length} songs you've played recently`
                      : 'No songs played yet'
                    }
                  </p>
                </div>

                {recentlyPlayed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recentlyPlayed.map((song, index) => (
                      <SongCard
                        key={`recent-${song._id}-${index}`}
                        song={song}
                        onPlay={() => handlePlaySong(song, recentlyPlayed)}
                        onKaraoke={handleKaraokeOpen}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No songs played yet</h3>
                    <p className="text-gray-400 mb-4">
                      Start listening to music to see your recently played songs here
                    </p>
                    <button 
                      onClick={() => setActiveTab('discover')}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      Discover Music
                    </button>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'artists' && <BrowseArtists onArtistSelect={handleArtistSelect} />}

            {activeTab === 'artist-page' && selectedArtist && (
              <ArtistPage 
                artist={selectedArtist} 
                onBack={handleBackToArtists}
              />
            )}

            {activeTab === 'following' && <FollowedArtists onArtistSelect={handleArtistSelect} />}

            {activeTab === 'followed-artists' && <FollowedArtists onArtistSelect={handleArtistSelect} />}

            {activeTab === 'profile' && <ProfileSettings />}

            {activeTab === 'settings' && <Settings />}

            {activeTab.startsWith('artist-') && (
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">
                    {activeTab.replace('artist-', '')}
                  </h2>
                  <p className="text-gray-400">
                    {songs.filter(song => song.artist === activeTab.replace('artist-', '')).length} songs
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {songs
                    .filter(song => song.artist === activeTab.replace('artist-', ''))
                    .map((song) => (
                      <SongCard
                        key={song._id}
                        song={song}
                        onPlay={() => handlePlaySong(song, songs.filter(s => s.artist === song.artist))}
                        onKaraoke={handleKaraokeOpen}
                      />
                    ))
                  }
                </div>
              </section>
            )}

            {activeTab === 'library' && (
              <section>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <Music className="h-8 w-8 text-blue-400 mr-3" />
                    <h1 className="text-3xl font-bold">Your Library</h1>
                  </div>
                  <p className="text-gray-400">
                    Your personal collection of songs and playlists
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <Music className="h-8 w-8 text-purple-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{librarySongs.length}</p>
                        <p className="text-gray-400 text-sm">Songs</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <List className="h-8 w-8 text-green-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{playlists.length}</p>
                        <p className="text-gray-400 text-sm">Playlists</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <Heart className="h-8 w-8 text-red-400 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{librarySongs.length + playlists.length}</p>
                        <p className="text-gray-400 text-sm">Total Items</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playlists Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <List className="h-5 w-5 text-green-400 mr-2" />
                      Your Playlists
                    </h2>
                    <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm">
                      Create Playlist
                    </button>
                  </div>
                  
                  {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {playlists.map((playlist) => (
                        <PlaylistCard key={playlist._id} playlist={playlist} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-800 rounded-lg">
                      <List className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
                      <p className="text-gray-400 mb-4">
                        Create your first playlist to organize your favorite songs
                      </p>
                      <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200">
                        Create Your First Playlist
                      </button>
                    </div>
                  )}
                </div>

                {/* Saved Songs Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold flex items-center mb-4">
                    <Music className="h-5 w-5 text-blue-400 mr-2" />
                    Saved Songs
                  </h2>
                  
                  {librarySongs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {librarySongs.map((song) => (
                        <SongCard
                          key={song._id}
                          song={song}
                          onPlay={() => handlePlaySong(song, librarySongs)}
                          onKaraoke={handleKaraokeOpen}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-800 rounded-lg">
                      <Music className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No saved songs yet</h3>
                      <p className="text-gray-400 mb-4">
                        Add songs to your library by clicking the "..." menu on any song and selecting "Add to Library"
                      </p>
                      <button 
                        onClick={() => setActiveTab('discover')}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Discover Music
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer />

      {/* Karaoke Mode */}
      {karaokeMode && selectedKaraokeSong && (
        <KaraokeMode song={selectedKaraokeSong} onClose={handleKaraokeClose} />
      )}

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={playlistModalOpen}
        onClose={closePlaylistModal}
        song={selectedSongForPlaylist}
        onSuccess={handlePlaylistSuccess}
      />
    </div>
  );
};

export default Dashboard;