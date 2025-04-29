import Joi from 'joi';

export const createPostHashtagSchema = Joi.object({
  postId: Joi.number().required().integer().positive().messages({
    'number.base': 'Post ID must be a number',
    'number.integer': 'Post ID must be an integer',
    'number.positive': 'Post ID must be positive',
    'any.required': 'Post ID is required',
  }),
  hashtagId: Joi.number().required().integer().positive().messages({
    'number.base': 'Hashtag ID must be a number',
    'number.integer': 'Hashtag ID must be an integer',
    'number.positive': 'Hashtag ID must be positive',
    'any.required': 'Hashtag ID is required',
  }),
}); 