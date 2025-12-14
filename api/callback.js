// api/callback.js
const axios = require('axios');
const qs = require('querystring');

module.exports = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send(`
      <h1>❌ No authorization code</h1>
      <p>Missing authorization code. Did you come from Spotify?</p>
      <p><a href="/">Back to player</a></p>
    `);
  }
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://spotifylink.vercel.app/api/callback',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const tokens = response.data;
    
    // Display tokens (in production, store in database)
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>✅ Spotify Connected!</title>
        <style>
          body { font-family: Arial; padding: 40px; text-align: center; }
          .token-box { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
          code { background: #333; color: #1DB954; padding: 10px; display: block; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>✅ Spotify Authorization Successful!</h1>
        
        <div class="token-box">
          <h3>Refresh Token (SAVE THIS):</h3>
          <code>${tokens.refresh_token}</code>
          <p><small>This token lasts for months. Save it in Vercel environment variables.</small></p>
        </div>
        
        <div class="token-box">
          <h3>Access Token (expires in 1 hour):</h3>
          <code>${tokens.access_token.substring(0, 50)}...</code>
        </div>
        
        <h3>📝 Next Steps:</h3>
        <ol style="text-align: left; max-width: 600px; margin: 20px auto;">
          <li><strong>Copy the Refresh Token above</strong></li>
          <li>Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a></li>
          <li>Select your "spotifylink" project</li>
          <li>Go to Settings → Environment Variables</li>
          <li>Add/Update: <strong>SPOTIFY_REFRESH_TOKEN</strong> = ${tokens.refresh_token}</li>
          <li>Also ensure you have SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET set</li>
          <li>Redeploy your project</li>
        </ol>
        
        <p><a href="/">🎵 Go to your player</a></p>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Callback error:', error.response?.data || error.message);
    res.status(500).send(`
      <h1>❌ Authorization Failed</h1>
      <p>Error: ${error.response?.data?.error || error.message}</p>
      <p><a href="/">Back to player</a></p>
    `);
  }
};
