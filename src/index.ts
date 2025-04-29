import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './routes/user.routes';
import { postRouter } from './routes/post.routes';
import { followRouter } from './routes/follow.routes';
import { likeRouter } from './routes/like.routes';
import { hashtagRouter } from './routes/hashtag.routes';
import { postHashtagRouter } from './routes/postHashtag.routes';
import { feedRouter } from './routes/feed.routes';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

app.get('/', (req, res) => {
  res.send('Welcome to the Social Media Platform API! Server is running successfully.');
});

const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/follows', followRouter);
apiRouter.use('/likes', likeRouter);
apiRouter.use('/hashtags', hashtagRouter);
apiRouter.use('/post-hashtags', postHashtagRouter);
apiRouter.use('/feed', feedRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
