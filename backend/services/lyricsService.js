const axios = require('axios');

class LyricsService {
  constructor() {
    this.geniusApiKey = process.env.GENIUS_API_KEY;
    this.geniusBaseUrl = 'https://api.genius.com';
  }

  // Search for a song on Genius
  async searchSong(artist, title) {
    try {
      if (!this.geniusApiKey) {
        throw new Error('Genius API key not configured');
      }

      const response = await axios.get(`${this.geniusBaseUrl}/search`, {
        headers: {
          'Authorization': `Bearer ${this.geniusApiKey}`
        },
        params: {
          q: `${artist} ${title}`
        }
      });

      const hits = response.data.response.hits;
      if (hits.length > 0) {
        return hits[0].result;
      }
      return null;
    } catch (error) {
      console.error('Error searching for song:', error.message);
      return null;
    }
  }

  // Get song details from Genius
  async getSongDetails(songId) {
    try {
      const response = await axios.get(`${this.geniusBaseUrl}/songs/${songId}`, {
        headers: {
          'Authorization': `Bearer ${this.geniusApiKey}`
        }
      });

      return response.data.response.song;
    } catch (error) {
      console.error('Error getting song details:', error.message);
      return null;
    }
  }

  // Note: Genius API doesn't provide direct lyrics access
  // This method would need web scraping which has legal implications
  // Instead, we'll provide the Genius URL for users to view lyrics
  async getLyricsInfo(artist, title) {
    try {
      const song = await this.searchSong(artist, title);
      if (song) {
        return {
          geniusId: song.id,
          geniusUrl: song.url,
          title: song.title,
          artist: song.primary_artist.name,
          thumbnail: song.song_art_image_thumbnail_url,
          // Note: For full lyrics, users need to visit the Genius URL
          lyricsNote: 'Visit the Genius URL to view full lyrics legally'
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting lyrics info:', error.message);
      return null;
    }
  }

  // Enhanced: Create sample lyrics structure for karaoke mode
  generateSampleLyrics(title) {
    return {
      title: title,
      structure: [
        {
          type: 'verse',
          number: 1,
          lines: [
            'Welcome to the music tonight',
            'Feel the rhythm in your soul',
            'Every beat brings us together',
            'Let the melody take control'
          ]
        },
        {
          type: 'chorus',
          lines: [
            'Sing it loud, sing it proud',
            'Let your voice be heard',
            'In this moment we are free',
            'Music speaks without a word'
          ]
        },
        {
          type: 'verse',
          number: 2,
          lines: [
            'Every note tells a story',
            'Every word has its place',
            'In this musical journey',
            'Find your rhythm and your grace'
          ]
        },
        {
          type: 'chorus',
          lines: [
            'Sing it loud, sing it proud',
            'Let your voice be heard',
            'In this moment we are free',
            'Music speaks without a word'
          ]
        },
        {
          type: 'bridge',
          lines: [
            'Close your eyes and feel the sound',
            'Let the music lift you high',
            'In this karaoke magic',
            'Watch your spirit learn to fly'
          ]
        },
        {
          type: 'outro',
          lines: [
            'Thank you for this moment',
            'Music lives within our hearts',
            'Keep on singing forever',
            'This is where the magic starts'
          ]
        }
      ],
      note: 'Replace with licensed lyrics or original content'
    };
  }
}

module.exports = new LyricsService();