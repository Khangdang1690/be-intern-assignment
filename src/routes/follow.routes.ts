import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createFollowSchema } from '../validations/follow.validation';
import { FollowController } from '../controllers/follow.controller';

export const followRouter = Router();
const followController = new FollowController();

// Get all follows
followRouter.get('/', followController.getAllFollows.bind(followController));

// Unfollow a user (specific route must come before parameterized routes)
followRouter.delete('/unfollow', validate(createFollowSchema), followController.unfollowUser.bind(followController));

// Get follow by id
followRouter.get('/:id', followController.getFollowById.bind(followController));

// Create new follow (follow a user)
followRouter.post('/', validate(createFollowSchema), followController.createFollow.bind(followController));

// Delete follow by id
followRouter.delete('/:id', followController.deleteFollow.bind(followController)); 