const express = require('express');
const router = express.Router();
const userModel = require('../models/user');

// Get all
router.get('/users', async (req, res) => {
  const users = await userModel.find({});
  try {
    res.send(users);
  } catch (err) {
    console.log('there was an error');
    res.status(500).send(err);
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    // if (!user) res.status(404).send("No user here")
    res.send(user);
  } catch {
    res.status(500).send(err);
    console.log('Not a valid user');
  }
});

// clear all users
router.delete('/users', async (req, res) => {
  try {
    const user = await userModel.deleteMany({});
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
