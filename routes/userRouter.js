const { Router } = require('express');
const prisma = require('../prismaClient');
const bcryptjs = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const userRouter = new Router();

userRouter.post(
  '/',
  body('email')
    .trim()
    .isEmail()
    .notEmpty()
    .withMessage('Email must be provided and valid'),
  body('username').trim().notEmpty().withMessage('Username must be provided'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.errors[0].msg });
    }
    // const user = req.user;
    const { username, email, password, role } = req.body;
    const hash = await bcryptjs.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hash,
          role: role || 'USER',
        },
      });
      res.json(user);
    } catch (err) {
      if ((err.code = 'P2002')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

userRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error', err: err });
  }
});

userRouter.get('/:userId/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.params.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error', err: err });
  }
});
module.exports = userRouter;
