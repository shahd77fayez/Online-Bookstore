import Joi from 'joi';
import {Types} from 'mongoose';

const dataMethods = ['body', 'params', 'query', 'headers', 'file'];

// Validate MongoDB ObjectId
const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? value : helper.message('Invalid ObjectId');
};

export const generalFields = {
  email: Joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 4,
    tlds: {allow: ['com', 'net']}
  }).required(),

  token: Joi.string().pattern(/^[\w\-.][-\w]*\.[\w\-.][-\w]*\.[\w.]*(?:-[-\w]*\.[\w.]*)*(?:[+/=][\w+./=]*)?$/).required(),

  password: Joi.string().min(6).required(),
  cPassword: Joi.string().valid(Joi.ref('password')).required(),

  id: Joi.string().custom(validateObjectId).required(),

  name: Joi.string().min(2).max(50).required(),

  file: Joi.object({
    size: Joi.number().positive(),
    path: Joi.string(),
    filename: Joi.string(),
    destination: Joi.string(),
    mimetype: Joi.string(),
    encoding: Joi.string(),
    originalname: Joi.string(),
    fieldname: Joi.string()
  })
};

// Middleware to Validate Request Data
export const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    dataMethods.forEach((key) => {
      if (schema[key]) {
        const {error} = schema[key].validate(req[key], {abortEarly: false});

        if (error) {
          validationErrors.push(...error.details.map((err) => ({
            message: err.message,
            path: err.path,
            type: err.type
          })));
        }
      }
    });

    if (validationErrors.length) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: validationErrors
      });
    }

    next();
  };
};
