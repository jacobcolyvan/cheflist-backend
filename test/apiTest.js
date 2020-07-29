const request = require('supertest');
const app = require('../server');

describe('GET /users', function () {
  it('respond with json containing a list of all users', function (done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('POST /auth/login – login attempts', function () {
  const correctLogin = {
    username: '100',
    password: '100100'
  };

  it('respond with userData on successful login', function (done) {
    request(app)
      .post('/auth/login')
      .send(correctLogin)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  const incorrectUser = {
    username: '200',
    password: '100100'
  };
  it('respond with "Invalid credentials (username)"', function (done) {
    request(app)
      .post('/auth/login')
      .send(incorrectUser)
      .set('Accept', 'application/json')
      .expect({ msg: 'Invalid credentials (username)' })
      .expect(400)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });

  const incorrectPass = {
    username: '100',
    password: '200200'
  };
  it('respond with "Invalid credentials (password)"', function (done) {
    request(app)
      .post('/auth/login')
      .send(incorrectPass)
      .set('Accept', 'application/json')
      .expect({ msg: 'Invalid credentials (password)' })
      .expect(400)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
});

// describe('POST /auth/register', function () {
//   let data = {
//     username: 'testing1',
//     password: '100100'
//   };

//   it('respond with "user created', function (done) {
//     request(app)
//       .post('/auth/login')
//       .send(data)
//       .set('Accept', 'application/json')
//       .expect('user created')
//       .expect(200)
//       .end((err) => {
//         if (err) return done(err.response);
//         done();
//       });
//   });
// });

describe('POST /auth/register (errors)', function () {
  let data = {
    username: '100',
    password: '100100'
  };
  it('respond with "Username already taken"', function (done) {
    request(app)
      .post('/auth/login')
      .send(data)
      .set('Accept', 'application/json')
      .expect({ msg: 'Username already taken' })
      .expect(400)
      .end((err) => {
        if (err) return done(err.response);
        done();
      });
  });

  let data2 = {
    username: 'testing2',
    password: '100'
  };
  it('respond with "Password is too short"', function (done) {
    request(app)
      .post('/auth/login')
      .send(data2)
      .set('Accept', 'application/json')
      .expect({ msg: 'Password is too short' })
      .expect(400)
      .end((err) => {
        if (err) return done(err.response);
        done();
      });
  });
});

describe('POST /auth/tokenIsValid', function () {
  const loginData = {
    username: '100',
    password: '100100'
  };
  let token = '';
  const wrongToken = 'made_up_token';

  before(function () {
    // runs once before the first test in this block
    request(app)
      .post('/auth/login')
      .send(loginData)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        token = res.body.token;
      });
  });

  it('returns user data when provided with successful token', function (done) {
    request(app)
      .post('/auth/tokenIsValid')
      .set({ 'x-auth-token': token })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err.response);
        done();
      });
  });

  it('returns invalid token', function (done) {
    request(app)
      .post('/auth/tokenIsValid')
      .set({ 'x-auth-token': wrongToken })
      .set('Accept', 'application/json')
      .expect({ msg: 'jwt malformed' })
      .expect(500, done);
  });

  it('returns no token', function (done) {
    request(app)
      .post('/auth/tokenIsValid')
      .set('Accept', 'application/json')
      .expect({ msg: 'no token' })
      .expect(500)
      .end((err) => {
        if (err) return done(err.response);
        done();
      });
  });
});
