const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // Get credentials
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    // Check if we need to authorize first
    if (!refreshToken) {
      return res.json({ 
        error: 'setup_required',
        message: 'Visit /api/auth to authorize Spotify first'
      });
    }
    
    // 1. Refresh access token
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
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
    
    // 2. Get currently playing
    const spotifyResponse = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (spotifyResponse.status === 204) {
      return res.json({ is_playing: false });
    }
    
    const data = spotifyResponse.data;
    
    return res.json({
      is_playing: true,
      name: data.item.name,
      artists: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      album_art_url: data.item.album.images[0]?.url,
      external_url: data.item.external_urls.spotify,
      progress_ms: data.progress_ms,
      duration_ms: data.item.duration_ms
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    // Handle expired refresh token
    if (error.response?.data?.error === 'invalid_grant') {
      return res.json({
        error: 'token_expired',
        message: 'Refresh token expired. Visit /api/auth to re-authorize.'
      });
    }
    
    return res.json({ 
      error: 'api_error',
      details: error.message 
    });
  }
};
