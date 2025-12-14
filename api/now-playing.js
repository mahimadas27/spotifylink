// api/now-playing.js
const axios = require('axios');
const qs = require('querystring');

// In a production app, use a database. For simplicity, we'll use environment variables.
// Store tokens as: ACCESS_TOKEN|REFRESH_TOKEN|EXPIRY_TIME
let tokenData = process.env.SPOTIFY_TOKENS ? JSON.parse(process.env.SPOTIFY_TOKENS) : null;

async function refreshAccessToken() {
  console.log('🔄 Refreshing Spotify token...');
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Update token data
    tokenData = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || tokenData.refresh_token, // Keep old if no new one
      expires_at: Date.now() + (response.data.expires_in * 1000)
    };
    
    console.log('✅ Token refreshed successfully');
    return tokenData.access_token;
    
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    throw error;
  }
}

async function getValidAccessToken() {
  // If no token data or token expired (with 5 minute buffer)
  if (!tokenData || Date.now() > tokenData.expires_at - 300000) {
    return await refreshAccessToken();
  }
  
  return tokenData.access_token;
}

// Main handler
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const accessToken = await getValidAccessToken();
    
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.status === 204) {
      return res.json({ is_playing: false, message: 'Nothing playing' });
    }
    
    const data = response.data;
    return res.json({
      is_playing: true,
      name: data.item.name,
      artists: data.item.artists.map(artist => artist.name).join(', '),
      album: data.item.album.name,
      album_art_url: data.item.album.images[0]?.url,
      progress_ms: data.progress_ms,
      duration_ms: data.item.duration_ms
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch currently playing track',
      details: error.message 
    });
  }
};
