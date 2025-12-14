const axios = require('axios');

module.exports = async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`
      <h1>❌ Spotify Authorization Failed</h1>
      <p>Error: ${error}</p>
      <p><a href="/">Back to player</a></p>
    `);
  }
  
  if (!code) {
    return res.send(`
      <h1>Missing Authorization Code</h1>
      <p>No code received from Spotify.</p>
      <p><a href="/api/auth">Try again</a></p>
    `);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://spotifylink-lime.vercel.app/api/callback',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const tokens = tokenResponse.data;
    
    // Success page with instructions
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>✅ Spotify Connected!</title>
        <style>
          body { font-family: Arial; padding: 40px; max-width: 800px; margin: 0 auto; }
          .success { background: #d4edda; color: #155724; padding: 20px; border-radius: 10px; }
          .token-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          code { background: #333; color: #1DB954; padding: 10px; display: block; overflow-x: auto; }
          .steps { margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Spotify Authorization Successful!</h1>
          <p>Your refresh token has been generated.</p>
        </div>
        
        <div class="token-box">
          <h3>Your Refresh Token:</h3>
          <code id="refreshToken">${tokens.refresh_token}</code>
          <button onclick="copyToken()">Copy to Clipboard</button>
        </div>
        
        <div class="steps">
          <h3>📝 Next Steps:</h3>
          <ol>
            <li><strong>Copy the refresh token above</strong></li>
            <li>Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a></li>
            <li>Select your "spotifylink" project</li>
            <li>Go to Settings → Environment Variables</li>
            <li>Add/Update: <strong>SPOTIFY_REFRESH_TOKEN</strong> = (paste your token)</li>
            <li>Make sure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are also set</li>
            <li>Save and redeploy</li>
          </ol>
        </div>
        
        <p><a href="/">🎵 Go to your player</a></p>
        
        <script>
          function copyToken() {
            const token = document.getElementById('refreshToken').textContent;
            navigator.clipboard.writeText(token);
            alert('Refresh token copied to clipboard!');
          }
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Callback error:', error.response?.data || error.message);
    res.send(`
      <h1>❌ Token Exchange Failed</h1>
      <p>Error: ${error.response?.data?.error || error.message}</p>
      <p><a href="/api/auth">Try again</a></p>
    `);
  }
};
