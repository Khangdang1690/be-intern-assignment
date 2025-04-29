import Joi from 'joi';

export const createUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'string.base': 'First name must be a string',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'string.base': 'Last name must be a string',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().messages({
    'string.base': 'First name must be a string',
  }),
  lastName: Joi.string().messages({
    'string.base': 'Last name must be a string',
  }),
  email: Joi.string().email().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export const getUserFollowersParamsSchema = Joi.object({
  id: Joi.number().required().integer().positive().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required',
  }),
});

export const getUserFollowersQuerySchema = Joi.object({
  limit: Joi.string().pattern(/^\d+$/).default('10').messages({
    'string.pattern.base': 'Limit must be a number',
  }),
  offset: Joi.string().pattern(/^\d+$/).default('0').messages({
    'string.pattern.base': 'Offset must be a number',
  }),
});
