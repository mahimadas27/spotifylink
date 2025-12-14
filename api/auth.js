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
        .btn { background: #1DB954; color: white; padding: 15px 30px; 
               border-radius: 25px; text-decoration: none; font-weight: bold;
               display: inline-block; margin: 20px; }
      </style>
    </head>
    <body>
      <h1>Connect to Spotify</h1>
      <p>Click below to authorize access to your Spotify account.</p>
      <a class="btn" href="${authUrl}">Authorize Spotify</a>
      <p><small>You'll be redirected to Spotify to log in and grant permissions.</small></p>
    </body>
    </html>
  `);
};
