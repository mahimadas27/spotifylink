// Simple Spotify API handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const token = process.env.SPOTIFY_TOKEN;
    
    if (!token) {
      return res.json({ error: 'No token set in Vercel' });
    }
    
    // Fetch from Spotify
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 204) {
      return res.json({ is_playing: false });
    }
    
    const data = await response.json();
    
    return res.json({
      is_playing: true,
      name: data.item.name,
      artists: data.item.artists.map(a => a.name).join(', '),
      album: data.item.album.name,
      image: data.item.album.images[0]?.url,
      url: data.item.external_urls.spotify
    });
    
  } catch (error) {
    return res.json({ error: error.message });
  }
};
