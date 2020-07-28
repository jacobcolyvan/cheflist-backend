const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userModel = require('../models/user');
const axios = require('axios');

router.post('/spotify/callback', auth, async (req, res) => {
  try {
    let code = req.body.code || null;
    let authOptions = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization':
          'Basic ' +
          (new Buffer.from(process.env.SPOTIFY_CLIENT_ID2 + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString(
            'base64'
          )),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    const spotifyRes = await axios(authOptions)
    const user = await userModel.findById(req.body.id);
    let spotifyTokens = {
      access: spotifyRes.data.access_token,
      refresh: spotifyRes.data.refresh_token
    };

    await user.updateOne({ spotifyTokens: spotifyTokens });
    console.log('tokens added to user');
    res.status(200).json({ access_token: spotifyTokens.access });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/spotify/refresh', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    let authOptions = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        refresh_token: user.spotifyTokens.refresh,
        grant_type: 'refresh_token'
      },
      headers: {
        'Authorization':
          'Basic ' +
          (new Buffer.from(process.env.SPOTIFY_CLIENT_ID2 + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString(
            'base64'
          )),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const spotifyRes = await axios(authOptions)

    let spotifyTokens = {
      access: spotifyRes.data.access_token,
      refresh: user.spotifyTokens.refresh
    };

    await user.updateOne({ spotifyTokens: spotifyTokens });
    console.log('new access token added to user');
    res.status(200).json({ access_token: spotifyTokens.access });
  } catch (err) {
    res.status(500).send('There was a problem with the refresh token request.');
  }
});

module.exports = router;
