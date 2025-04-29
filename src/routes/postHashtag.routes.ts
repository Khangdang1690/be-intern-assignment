import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createPostHashtagSchema } from '../validations/postHashtag.validation';
import { PostHashtagController } from '../controllers/postHashtag.controller';

export const postHashtagRouter = Router();
const postHashtagController = new PostHashtagController();

// Get all post hashtags
postHashtagRouter.get('/', postHashtagController.getAllPostHashtags.bind(postHashtagController));

// Remove hashtag from post (specific route must come before parameterized routes)
postHashtagRouter.delete('/remove', validate(createPostHashtagSchema), postHashtagController.removeHashtagFromPost.bind(postHashtagController));

// Get post hashtag by id
postHashtagRouter.get('/:id', postHashtagController.getPostHashtagById.bind(postHashtagController));

// Create new post hashtag (tag a post with a hashtag)
postHashtagRouter.post('/', validate(createPostHashtagSchema), postHashtagController.createPostHashtag.bind(postHashtagController));

// Delete post hashtag by id
postHashtagRouter.delete('/:id', postHashtagController.deletePostHashtag.bind(postHashtagController)); 