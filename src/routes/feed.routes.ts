import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { getFeedBodySchema, getFeedQuerySchema } from '../validations/feed.validation';
import { FeedController } from '../controllers/feed.controller';

export const feedRouter = Router();
const feedController = new FeedController();

// Get user feed - userId is sent in the request body
feedRouter.post(
  '/',
  validate(getFeedBodySchema, 'body'),
  validate(getFeedQuerySchema, 'query'),
  feedController.getFeed.bind(feedController)
); 