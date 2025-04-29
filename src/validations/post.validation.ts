import Joi from 'joi';

export const createPostSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Post content is required',
    'string.min': 'Post content cannot be empty',
    'string.max': 'Post content cannot exceed 1000 characters',
  }),
  authorId: Joi.number().required().integer().positive().messages({
    'number.base': 'Author ID must be a number',
    'number.integer': 'Author ID must be an integer',
    'number.positive': 'Author ID must be positive',
    'any.required': 'Author ID is required',
  }),
});

export const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).messages({
    'string.min': 'Post content cannot be empty',
    'string.max': 'Post content cannot exceed 1000 characters',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  }); 