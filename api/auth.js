module.exports = async (req, res) => {
  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID || '5979d6bbe8d3452eafd9e3f0a7f319bd',
    response_type: 'code',
    redirect_uri: 'https://spotifylink-lime.vercel.app/api/callback',
    scope: 'user-read-currently-playing user-read-playback-state',
    show_dialog: 'true'
  })}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authorize Spotify</title>
      <style>
        body { font-family: Arial; padding: 40px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; }
        .btn { background: #1DB954; color: white; padding: 15px 30px; 
               border-radius: 25px; text-decoration: none; font-weight: bold;
               display: inline-block; margin: 20px; font-size: 18px; }
        .steps { text-align: left; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔗 Connect Spotify for Auto-Refresh</h1>
        <p>This will give you a refresh token that works for <strong>months</strong> instead of 1 hour.</p>
        
        <div class="steps">
          <h3>📝 What happens next:</h3>
          <ol>
            <li>Click the button below</li>
            <li>Log in to Spotify (if not already)</li>
            <li>Click "Agree" to grant permissions</li>
            <li>You'll get a refresh token to save in Vercel</li>
            <li>Your tokens will auto-refresh forever! 🎉</li>
          </ol>
        </div>
        
        <a class="btn" href="${authUrl}">🔑 Authorize Spotify</a>
        
        <p><small>This only needs to be done once. The refresh token lasts for months.</small></p>
      </div>
    </body>
    </html>
  `);
};
