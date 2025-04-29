import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { 
  createUserSchema, 
  updateUserSchema, 
  getUserFollowersParamsSchema,
  getUserFollowersQuerySchema,
  getUserActivityParamsSchema,
  getUserActivityQuerySchema
} from '../validations/user.validation';
import { UserController } from '../controllers/user.controller';

export const userRouter = Router();
const userController = new UserController();

// Get all users
userRouter.get('/', userController.getAllUsers.bind(userController));

// Get user by id
userRouter.get('/:id', userController.getUserById.bind(userController));

// Get user's followers
userRouter.get(
  '/:id/followers', 
  validate(getUserFollowersParamsSchema, 'params'),
  validate(getUserFollowersQuerySchema, 'query'),
  userController.getUserFollowers.bind(userController)
);

// Get user's activity
userRouter.get(
  '/:id/activity',
  validate(getUserActivityParamsSchema, 'params'),
  validate(getUserActivityQuerySchema, 'query'),
  userController.getUserActivity.bind(userController)
);

// Create new user
userRouter.post('/', validate(createUserSchema), userController.createUser.bind(userController));

// Update user
userRouter.put('/:id', validate(updateUserSchema), userController.updateUser.bind(userController));

// Delete user
userRouter.delete('/:id', userController.deleteUser.bind(userController));
