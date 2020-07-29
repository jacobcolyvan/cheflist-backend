const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const userModel = require('../models/user');

router.get('/user', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    res.json({
      username: user.username,
      user: user.id,
      recipes: user.recipes
    });
  } catch {
    res.status(500).send(err);
    console.log('No user here');
  }
});

//edit an account's password and username
router.put('/user/:id', auth, async (req, res) => {
  const user = await userModel.findById(req.params.id);
  console.log(user.username);
  //logic for updating username

  if (req.body.newUsername) {
    try {
      if (req.body.newUsername !== user.username) {
        await user.update({ username: req.body.newUsername });
        return res
          .status(200)
          .send(`Username has been updated to ${req.body.newUsername}`);
      } else {
        return res.status(400).send('Could not update username');
      }
    } catch (error) {
      return res.status(400).send('Could not update username');
    }
  }
  //logic for updating password and encrypting it

  try {
    if (req.body.newPassword && req.body.newPassword.length > 5) {
      console.log(req.body.newPassword.length);
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isMatch) {
        console.log('Current password does not match');
        res.status(400).send('Current password does not match');
        // .json({ errors: [{ msg: 'Invalid credentials (password)' }] });
      } else {
        const salt = await bcrypt.genSalt(10);

        req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

        await user.update({ password: req.body.newPassword });

        console.log('Password has been updated');
        res.status(200).send('Password has been updated');
      }
    } else {
      throw error;
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//delete an account
router.delete('/user/:id', auth, async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) res.status(404).send('No user here');
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update for recipes
// @ private
router.put('/users/recipes/add', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    let newRecipes = [...user.recipes, req.body.newRecipe];
    await user.updateOne({ recipes: newRecipes });
    res.send(newRecipes);
  } catch (err) {
    console.log('no adding nothing mon');
    res.status(400).send(err);
  }
});

//delete recipes
router.put('/users/recipes/delete', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);

    let recipeIndex = user.recipes.findIndex(
      (recipe) => recipe.id == req.body.recipeId
    );

    if (recipeIndex === null) throw 'no recipe with given id found';
    let newRecipes = user.recipes;
    newRecipes.splice(recipeIndex, 1);

    await user.updateOne({ recipes: newRecipes });
    res.status(200).send(newRecipes);
  } catch (err) {
    console.log('no deleting this time');
    res.status(400).send(err);
    console.log(err.message);
  }
});

// route to add playlist to a user's recipe
router.put('/users/recipes/add-playlist', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    const newPlaylistRef = req.body.newPlaylistRef;
    let recipeIndex = user.recipes.findIndex(
      (recipe) => recipe.id == req.body.recipeId
    );
    if (recipeIndex === null) throw 'no recipe with given id found';

    let newRecipes = user.recipes;
    newRecipes[recipeIndex].playlistRef = newPlaylistRef;

    await user.updateOne({ recipes: newRecipes });
    res.status(200).send(newRecipes);
  } catch (err) {
    console.log('no adding this playlist mon');
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;
