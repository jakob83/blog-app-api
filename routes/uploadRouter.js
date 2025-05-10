const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const uploadRouter = new Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/' + path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

uploadRouter.post('/', upload.single('file'), (req, res) => {
  console.log(req.file);
  res
    .status(200)
    .json({ location: process.env.URL + '/uploads/' + req.file.filename });
});

module.exports = uploadRouter;
