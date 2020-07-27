const mongoose = require('mongoose');
const { stringify } = require('querystring');
const Schema = mongoose.Schema;

const User = new Schema({
  username: {
    type: String,
    required: true
    // match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  password: { type: String, required: true, minlength: 6 },
  recipes: [
    {
      name: {
        type: String,
        required: true
      },
      image: {
        type: String,
        default: ''
      },
      recipeUrl: {
        type: String,
        default: ''
      },
      cuisines: {
        type: Object,
        default: ''
      },
      sourceName: {
        type: String,
        default: ''
      },
      summary: {
        type: String,
        default: ''
      },
      preptime: {
        type: Number,
        default: ''
      },
      totalCookingTime: {
        type: Number,
        default: ''
      },
      ingredients: {
        type: Object,
        default: ''
      },
      dishTypes: {
        type: Object,
        default: ''
      },
      diets: {
        type: Object,
        default: ''
      },
      instructions: {
        type: Object,
        default: ''
      },
      winePairing: {
        type: Object,
        default: ''
      },
      playlistRef: {
        type: String,
        default: '7jDnWwQfQYZx2bkqdSlf3F'
      },
      cookingTime: {
        type: String,
        default: ''
      },
      id: {
        type: String,
        default: ''
      }
    }
  ],
  spotifyTokens: {
    // this one gets returned
    access: {
      type: String,
      default: ''
    },
    // this one stays on the backend
    refresh: {
      type: String,
      default: ''
    }
  }
});

module.exports = mongoose.model('User', User);
