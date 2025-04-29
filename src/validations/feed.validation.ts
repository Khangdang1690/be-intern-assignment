import Joi from 'joi';

export const getFeedBodySchema = Joi.object({
  userId: Joi.number().required().integer().positive().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required',
  }),
});

export const getFeedQuerySchema = Joi.object({
  limit: Joi.string().pattern(/^\d+$/).default('10').messages({
    'string.pattern.base': 'Limit must be a number',
  }),
  offset: Joi.string().pattern(/^\d+$/).default('0').messages({
    'string.pattern.base': 'Offset must be a number',
  }),
}); 