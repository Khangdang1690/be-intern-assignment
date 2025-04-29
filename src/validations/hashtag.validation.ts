import Joi from 'joi';

export const createHashtagSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(255).messages({
    'string.base': 'Hashtag name must be a string',
    'string.empty': 'Hashtag name cannot be empty',
    'string.min': 'Hashtag name must be at least 1 character long',
    'string.max': 'Hashtag name cannot exceed 255 characters',
    'any.required': 'Hashtag name is required',
  }),
}); 