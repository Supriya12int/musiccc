import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAllUsers: () => api.get('/users'),
  addToFavorites: (songId) => api.post(`/users/favorites/${songId}`),
  removeFromFavorites: (songId) => api.delete(`/users/favorites/${songId}`),
  getFavorites: () => api.get('/users/favorites'),
};

// Music API
export const musicAPI = {
  getSongs: (params) => api.get('/music/songs', { params }),
  getSong: (id) => api.get(`/music/songs/${id}`),
  addSong: (songData) => api.post('/music/songs', songData),
  deleteSong: (id) => api.post(`/music/songs/${id}/delete`),
  incrementPlayCount: (id) => api.put(`/music/songs/${id}/play`),
  getPopularSongs: (limit = 10) => api.get(`/music/popular?limit=${limit}`),
  getRecommendations: () => api.get('/music/recommendations'),
  getMySongs: (params) => api.get('/music/my-songs', { params }),
  getArtistStats: () => api.get('/music/artist-stats'),
  uploadAudio: (file) => {
    const form = new FormData();
    form.append('audio', file);
    return api.post('/music/songs/upload-audio', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCover: (file) => {
    const form = new FormData();
    form.append('cover', file);
    return api.post('/music/songs/upload-cover', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadFromYouTube: (url) => api.post('/download/youtube', { url }),
  downloadFromURL: (url) => api.post('/download/url', { url }),
  searchSpotify: (query) => api.get(`/spotify/search?q=${encodeURIComponent(query)}`),
  importFromSpotify: (spotifyData) => api.post('/spotify/import', spotifyData),
};

// Spotify API
export const spotifyAPI = {
  search: (query) => api.get(`/spotify/search?q=${encodeURIComponent(query)}`),
  getTrack: (trackId) => api.get(`/spotify/track/${trackId}`),
  importTrack: (spotifyTrack) => api.post('/spotify/import', spotifyTrack),
};

// Playlists API
export const playlistsAPI = {
  getUserPlaylists: () => api.get('/playlists'),
  getPublicPlaylists: (params) => api.get('/playlists/public', { params }),
  getPlaylist: (id) => api.get(`/playlists/${id}`),
  createPlaylist: (playlistData) => api.post('/playlists', playlistData),
  updatePlaylist: (id, playlistData) => api.put(`/playlists/${id}`, playlistData),
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  addSongToPlaylist: (playlistId, songId) => api.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSongFromPlaylist: (playlistId, songId) => api.delete(`/playlists/${playlistId}/songs/${songId}`),
};

// Artists API
export const artistsAPI = {
  getPopularArtists: () => api.get('/artists/popular'),
  searchArtists: (query) => api.get(`/artists/search?query=${encodeURIComponent(query)}`),
  followArtist: (artistName) => api.post('/artists/follow', { artistName }),
  unfollowArtist: (artistName) => api.delete('/artists/unfollow', { data: { artistName } }),
  getFollowedArtists: () => api.get('/artists/followed'),
  getArtistSongs: (artistName, params) => api.get(`/artists/${encodeURIComponent(artistName)}/songs`, { params }),
  checkFollowing: (artistNames) => api.post('/artists/check-following', { artistNames }),
};

// Library API
export const libraryAPI = {
  getUserLibrary: () => api.get('/library'),
  addToLibrary: (songId) => api.post(`/library/add/${songId}`),
  removeFromLibrary: (songId) => api.delete(`/library/remove/${songId}`),
  checkInLibrary: (songId) => api.get(`/library/check/${songId}`),
};

// Events API
export const eventsAPI = {
  getAllEvents: (params) => api.get('/events', { params }),
  getUpcomingEvents: () => api.get('/events/upcoming'),
  getFollowedArtistsEvents: () => api.get('/events/following'),
  getEventById: (eventId) => api.get(`/events/${eventId}`),
  markInterested: (eventId) => api.post(`/events/${eventId}/interested`),
  removeInterest: (eventId) => api.delete(`/events/${eventId}/interested`),
};

export default api;