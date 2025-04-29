import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createLikeSchema } from '../validations/like.validation';
import { LikeController } from '../controllers/like.controller';

export const likeRouter = Router();
const likeController = new LikeController();

// Get all likes
likeRouter.get('/', likeController.getAllLikes.bind(likeController));

// Unlike a post (specific route must come before parameterized routes)
likeRouter.delete('/unlike', validate(createLikeSchema), likeController.unlikePost.bind(likeController));

// Get like by id
likeRouter.get('/:id', likeController.getLikeById.bind(likeController));

// Create new like (like a post)
likeRouter.post('/', validate(createLikeSchema), likeController.createLike.bind(likeController));

// Delete like by id
likeRouter.delete('/:id', likeController.deleteLike.bind(likeController)); 