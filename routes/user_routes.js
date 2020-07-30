// Declare the libraries needed
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
// Declare the user-model we're using
const userModel = require('../models/user');

// These are the main routes of the app which let us change
// the users ih the db. These are private and can only be accessed
// if a correct token is provided in the request header.

// Delete an account given the correct id and token
router.delete('/:id', auth, async (req, res) => {
  try {
    // Search by id and delete user
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) res.status(400).send('No user here');
    console.log('user deleted');
    res.status(200).send('User has been deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update/edit an existing account's password and username
router.put('/:id', auth, async (req, res) => {
  try {
    // Find user by id in request
    const user = await userModel.findById(req.params.id);
    // Logic for updating username
    if (req.body.newUsername) {
      // Only update if newUsername does not match current
      if (req.body.newUsername !== user.username) {
        await user.updateOne({ username: req.body.newUsername });
        return res
          .status(200)
          .send(`Username has been updated to ${req.body.newUsername}`);
      } else {
        throw 'Please provide a new username';
      }
    }

    // Logic for updating password and encrypting it
    if (req.body.newPassword) {
      if (req.body.newPassword.length > 5) {
        // Check if current password in req is the same as the current
        const isMatch = await bcrypt.compare(
          req.body.currentPassword,
          user.password
        );

        // Only proceed if current password is a match
        if (!isMatch) {
          console.log('Current password does not match');
          res.status(400).send('Current password does not match');
        } else {
          // hash the new password and update the user
          const salt = await bcrypt.genSalt(10);
          req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

          await user.update({ password: req.body.newPassword });
          console.log('Password has been updated');
          res.status(200).send('Password has been updated');
        }
      } else {
        throw 'New Password does not meet requirements';
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err);
  }
});

// A route for adding a recipe onto a users recipe array
router.put('/recipes/add', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    //  Create an new array with the new recipe on the end, and update user
    let newRecipes = [...user.recipes, req.body.newRecipe];
    await user.updateOne({ recipes: newRecipes });
    res.send(newRecipes);
  } catch (err) {
    console.log('no adding nothing mon');
    res.status(400).send(err);
  }
});

// Delete a recipe from a users recipe array
router.put('/recipes/delete', auth, async (req, res) => {
  try {
    // find current user in db, and the recipe index of the recipe to be deleted.
    const user = await userModel.findById(req.body.id);
    const recipeIndex = user.recipes.findIndex(
      (recipe) => recipe.id == req.body.recipeId
    );

    // splice the recipe from the user array using the index
    if (recipeIndex === null) throw 'no recipe with given id found';
    let newRecipes = [...user.recipes];
    newRecipes.splice(recipeIndex, 1);
    // update user and return new recipes
    await user.updateOne({ recipes: newRecipes });
    res.status(200).send(newRecipes);
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err);
  }
});

// route to add playlist to a user's recipe
router.put('/recipes/add-playlist', auth, async (req, res) => {
  try {
    // find user and recipe from the req params, and throw error on fail
    const user = await userModel.findById(req.body.id);
    const recipeIndex = user.recipes.findIndex(
      (recipe) => recipe.id == req.body.recipeId
    );
    if (recipeIndex === null) throw 'no recipe with given id found';

    // set new playlist id onto recipe object
    const newPlaylistRef = req.body.newPlaylistRef;
    let newRecipes = [...user.recipes];
    newRecipes[recipeIndex].playlistRef = newPlaylistRef;

    // update user and send back new recipe array
    await user.updateOne({ recipes: newRecipes });
    res.status(200).send(newRecipes);
  } catch (err) {
    console.log('no adding this playlist, mon');
    console.log(err.message);
    res.status(400).send(err.message);
  }
});

module.exports = router;
