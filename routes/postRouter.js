const { Router } = require('express');
const prisma = require('../prismaClient');
const passport = require('passport');

const postRouter = new Router();

postRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // const user = req.user;
    const { title, content, isPublished } = req.body;
    const userId = req.user.id;
    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId: userId,
          isPublished: Boolean(isPublished),
        },
      });
      return res.json(post);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error', err: err });
    }
  }
);

postRouter.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
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

postRouter.put(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // const user = req.user;
    let { title, content, isPublished } = req.body;
    isPublished = Boolean(isPublished);
    const { postId } = req.params;
    const userId = req.user.id;
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post.authorId !== userId) {
        return res
          .status(401)
          .json({ error: 'You are not authorized to edit this post' });
      }
      const newPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          title,
          content,
          isPublished,
        },
      });
      return res.json(newPost);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error', err: err });
    }
  }
);

postRouter.delete(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    userId = req.user.id;
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      if (post.authorId !== userId) {
        return res
          .status(401)
          .json({ error: 'You are not authorized to delete this post' });
      }
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });
      return res.json(post);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error', err: err });
    }
  }
);

postRouter.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          include: {
            user: { select: { username: true } },
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error', err: err });
  }
});

postRouter.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            is: true,
            username: true,
          },
        },
      },
    });
    return res.json(comments);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error', err: err });
  }
});

// Create Comment:
postRouter.post(
  '/:postId/comments',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          postId: postId,
          userId,
        },
      });
      return res.json(comment);
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error', err: err });
    }
  }
);

postRouter.delete(
  '/:postId/comments/:commentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      if (comment.userId !== userId) {
        return res
          .status(401)
          .json({ error: 'You are not authorized to delete this comment' });
      }
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
      return res.json(comment);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error', err: err });
    }
  }
);

module.exports = postRouter;
