const axios = require('axios');

class SpotifyService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get client credentials access token
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Spotify credentials not configured');
      }

      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  // Search for tracks on Spotify
  async searchTrack(artist, title) {
    try {
      const token = await this.getAccessToken();
      const query = `artist:"${artist}" track:"${title}"`;
      
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: 1
        }
      });

      const tracks = response.data.tracks.items;
      return tracks.length > 0 ? tracks[0] : null;
    } catch (error) {
      console.error('Error searching Spotify track:', error);
      return null;
    }
  }

  // Get track details by Spotify ID
  async getTrack(spotifyId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseURL}/tracks/${spotifyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting Spotify track:', error);
      return null;
    }
  }

  // Format track data for our database
  formatTrackData(spotifyTrack) {
    if (!spotifyTrack) return null;

    return {
      spotifyId: spotifyTrack.id,
      spotifyUri: spotifyTrack.uri,
      previewUrl: spotifyTrack.preview_url,
      spotifyUrl: spotifyTrack.external_urls.spotify,
      popularity: spotifyTrack.popularity,
      albumImageUrl: spotifyTrack.album.images?.[0]?.url || null,
      albumName: spotifyTrack.album.name,
      releaseDate: spotifyTrack.album.release_date,
      durationMs: spotifyTrack.duration_ms,
      explicit: spotifyTrack.explicit
    };
  }
}

module.exports = new SpotifyService();