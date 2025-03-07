import Joi from 'joi';

export const bookSchemaValidation = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  author: Joi.string().min(3).max(100).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().max(500).optional(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().required()
});
