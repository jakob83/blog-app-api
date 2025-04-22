const express = require('express');
require('dotenv').config();
const postRouter = require('./routes/postRouter');
const userRouter = require('./routes/userRouter');
const app = express();

// For forms
app.use(express.urlencoded({ extended: true }));
// For json req
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log('listening on port 8080'));
