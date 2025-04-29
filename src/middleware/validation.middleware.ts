import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // Transform the error if it's a self-follow validation error
      const errorMessages = error.details.map((detail) => {
        if (detail.type === 'followerId.selfFollow') {
          return 'Users cannot follow themselves';
        }
        return detail.message;
      }).join(', ');
      
      return res.status(400).json({ message: errorMessages });
    }

    next();
  };
};
