import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

type ValidationType = 'body' | 'query' | 'params';

export const validate = (schema: Joi.ObjectSchema, type: ValidationType = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    let dataToValidate;

    switch (type) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      default:
        dataToValidate = req.body;
    }

    const { error } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // Always use custom error message if present in context
      const errorMessages = error.details.map((detail) => {
        if (detail.context && detail.context.message) {
          return detail.context.message;
        }
        return detail.message;
      }).join(', ');
      return res.status(400).json({ message: errorMessages });
    }

    next();
  };
};
