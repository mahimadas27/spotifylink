const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // 1. Get credentials from environment
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!refreshToken) {
      return res.json({ 
        error: 'No refresh token',
        message: 'You need to authorize first. Visit /api/auth to start.'
      });
    }
    
    // 2. Refresh the access token
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
    
    // 3. Get currently playing track
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
      external_url: data.item.external_urls.spotify
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.error === 'invalid_grant') {
      return res.json({
        error: 'Refresh token expired',
        message: 'You need to re-authorize. The refresh token is no longer valid.'
      });
    }
    
    return res.json({ error: error.message });
  }
};
