const express = require('express');
const router = express.Router();
const request = require('request');
// const axios = require('axios');
const auth = require('../middleware/auth');
const userModel = require('../models/user');

router.post('/spotify/callback', auth, async (req, res) => {
  try {
    let code = req.body.code || null;
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(
            process.env.SPOTIFY_CLIENT_ID2 +
              ':' +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64')
      },
      json: true
    };

    request.post(authOptions, async function (error, response, body) {
      console.log('–––');
      console.log(body);

      const user = await userModel.findById(req.body.id);
      let spotifyTokens = {
        access: body.access_token,
        refresh: body.refresh_token
      };
      await user.updateOne({ spotifyTokens: spotifyTokens });
      console.log('tokens added to user');
      res.status(200).json({ access_token: body.access_token });
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/spotify/refresh', auth, async (req, res) => {
  const user = await userModel.findById(req.body.id);
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      refresh_token: user.spotifyTokens.refresh,
      grant_type: 'refresh_token'
    },
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID2 +
            ':' +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
    },
    json: true
  };

  request.post(authOptions, async function (error, response, body) {
    // console.log(body);
    let spotifyTokens = {
      access: body.access_token,
      refresh: user.spotifyTokens.refresh
    };
    await user.updateOne({ spotifyTokens: spotifyTokens });
    console.log('new access token added to user');
    res.status(200).json({ access_token: body.access_token });
  });
});

module.exports = router;
