const express = require('express');
const router = express.Router();
const axios = require('axios');

// Import auth middleware and userModel
const auth = require('../middleware/auth');
const userModel = require('../models/user');

// These are the functions that handle the backend spotify token requests.
// They are private, each requiring a correct token in the header.

// Function recieves the spotify grant code from React, which allows the
// token request to proceed
router.post('/callback', auth, async (req, res) => {
  try {
    let code = req.body.code || null;
    if (code === null) throw 'no code in request';

    // Set auth options for authrization code request flow
    let authOptions = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        // This encodes the client secret and Id
        Authorization:
          'Basic ' +
          new Buffer.from(
            process.env.SPOTIFY_CLIENT_ID2 +
              ':' +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    // Make request to Spotify and search for user
    const spotifyRes = await axios(authOptions);
    const user = await userModel.findById(req.body.id);
    let spotifyTokens = {
      access: spotifyRes.data.access_token,
      refresh: spotifyRes.data.refresh_token
    };

    // Add both tokens to user
    await user.updateOne({ spotifyTokens: spotifyTokens });
    console.log('tokens added to user');
    res.status(200).send({ access_token: spotifyTokens.access });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message });
  }
});

// A function that uses the refresh token attached to the user,
// to request a new access token
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    // Set refresh token auth/request options
    let authOptions = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        refresh_token: user.spotifyTokens.refresh,
        grant_type: 'refresh_token'
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer.from(
            process.env.SPOTIFY_CLIENT_ID2 +
              ':' +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    // Make Spotify req., and add new access token to user
    const spotifyRes = await axios(authOptions);

    let spotifyTokens = {
      access: spotifyRes.data.access_token,
      refresh: user.spotifyTokens.refresh
    };

    await user.updateOne({ spotifyTokens: spotifyTokens });
    console.log('new access token added to user');
    res.status(200).send({ access_token: spotifyTokens.access });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('There was a problem with the refresh token request.');
  }
});

module.exports = router;
