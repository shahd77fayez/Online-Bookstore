import Joi from 'joi';

export const orderSchema = Joi.object({
  books: Joi.array().items(
    Joi.object({
      book: Joi.string().required(),
      quantity: Joi.number().required().min(1)
    })
  ).required()
});
