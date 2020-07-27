const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/user_routes.js');
const spotifyRouter = require('./routes/spotify_routes.js');
const devRouter = require('./routes/dev_routes.js');
const cors = require('cors');

require('dotenv').config({ path: './.env' });
// console.log(process.env.SPOTIFY_CLIENT_ID2);

const app = express();
app.use(express.json()); //init middleware
app.use(cors());

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   console.log(res);
//   console.log("cors");
//   next();
// });

app.use(userRouter);
app.use(devRouter);
//Defining route for auth
app.use('/auth', require('./routes/auth_routes'));
app.use(spotifyRouter);

app.listen(process.env.PORT, () => {
  console.log(`Servers running on port ${process.env.PORT}`);
});
