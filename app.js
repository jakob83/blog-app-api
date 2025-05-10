const express = require('express');
require('dotenv').config();
const cors = require('cors');
const postRouter = require('./routes/postRouter');
const userRouter = require('./routes/userRouter');
const loginRouter = require('./routes/loginRouter');
const passport = require('passport');
const uploadRouter = require('./routes/uploadRouter');
const app = express();

const allowlist = process.env.CORS_ORIGIN.split(',');
function corsOptionsDelegate(req, callback) {
  let corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));

// For forms
app.use(express.urlencoded({ extended: true }));
// For json req
app.use(express.json());

// passport setup with JWT
require('./passport-config');

app.use('/uploads', express.static('uploads'));

app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/login', loginRouter);
app.use('/upload', uploadRouter);
app.get('/me', (req, res) => {
  // Call Passport's authenticate manually
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      res.json({ user: null }); // optional: handle error
    }
    if (user) {
      return res.json({ user });
    } else {
      return res.json({ user: null });
    }
  })(req, res);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log('listening on port 8080'));
