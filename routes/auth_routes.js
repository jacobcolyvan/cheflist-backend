const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// authenticate user and get json web token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await userModel.findOne({ username });

    if (!user) {
      return res.status(400).send({ msg: 'Invalid credentials (username)' });
    }

    //compare entered password to the stored hash password of a found user
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ msg: 'Invalid credentials (password)' });
    }

    const spotifyAuth = user.spotifyTokens.refresh ? true : false;

    const recipes = user.recipes;
    const _id = user.id;
    const payload = {
      user: {
        id: _id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        return res.status(200).json({ token, _id, recipes, spotifyAuth });
      }
    );
  } catch (err) {
    console.log(err);
    console.log('there was an error');
    res.status(500).send(error.msg);
  }
});

// Create new user,
router.post('/register', async (req, res) => {
  const { username, password, recipes } = req.body;

  try {
    let check = await userModel.findOne({ username });
    if (check) {
      return res.status(400).send({ msg: 'Username already taken' });
    }
    //backend validation for password length
    if (password.length < 6) {
      return res.status(400).send({ msg: 'Password is too short' });
    }

    const salt = await bcrypt.genSalt(10); //create salt for password
    let user = new userModel({
      username,
      password,
      recipes,
      spotifyTokens: { access: '', refresh: '' }
    });
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    const _id = user.id;
    const payload = {
      user: {
        id: _id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.status(200).send('user created');
      }
    );

    // res.send(user);
  } catch (err) {
    console.log();
    res.status(500).send(err.message);
  }
});

router.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(400).send({ msg: 'no token' });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(400).send({ msg: 'invalid token' });

    const user = await userModel.findById(verified.user.id);
    if (!user) return res.status(400).send({ msg: 'inavlid token' });
    const spotifyAuth = user.spotifyTokens.refresh ? true : false;

    userObject = {
      isUser: true,
      token,
      _id: user._id,
      recipes: user.recipes,
      spotifyAuth
    };
    let isUser = true;
    return res.status(200).json(userObject);
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
});

module.exports = router;
