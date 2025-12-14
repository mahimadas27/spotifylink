// api/now-playing.js (updated version)
const axios = require('axios');
const qs = require('querystring');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // Get refresh token from environment
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!refreshToken || !clientId || !clientSecret) {
      return res.status(500).json({ 
        error: 'Server not configured',
        message: 'Missing Spotify credentials in environment variables'
      });
    }
    
    // Always refresh token on each call (simplest approach for serverless)
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Now fetch current track
    const spotifyResponse = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (spotifyResponse.status === 204) {
      return res.json({ is_playing: false, message: 'Nothing playing' });
    }
    
    const data = spotifyResponse.data;
    return res.json({
      is_playing: true,
      name: data.item.name,
      artists: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      album_art_url: data.item.album.images[0]?.url,
      external_url: data.item.external_urls.spotify
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.response?.status === 400) {
      return res.status(401).json({ 
        error: 'Refresh token expired',
        message: 'You need to re-authorize. Visit the setup page.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch track',
      details: error.message 
    });
  }
};
