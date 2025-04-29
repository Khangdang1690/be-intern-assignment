import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createHashtagSchema } from '../validations/hashtag.validation';
import { HashtagController } from '../controllers/hashtag.controller';

export const hashtagRouter = Router();
const hashtagController = new HashtagController();

// Get all hashtags
hashtagRouter.get('/', hashtagController.getAllHashtags.bind(hashtagController));

// Get hashtag by id
hashtagRouter.get('/:id', hashtagController.getHashtagById.bind(hashtagController));

// Create new hashtag
hashtagRouter.post('/', validate(createHashtagSchema), hashtagController.createHashtag.bind(hashtagController));

// Update hashtag
hashtagRouter.put('/:id', validate(createHashtagSchema), hashtagController.updateHashtag.bind(hashtagController));

// Delete hashtag
hashtagRouter.delete('/:id', hashtagController.deleteHashtag.bind(hashtagController)); 