import Joi from 'joi';
import {Types} from 'mongoose';

const isValidObjectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const createNotificationSchema = Joi.object({
  recipients: Joi.array().items(
    Joi.string().custom(isValidObjectId, 'valid MongoDB id')
  ),
  type: Joi.string()
    .valid('order_status', 'review', 'system')
    .required(),
  title: Joi.string()
    .required()
    .trim(),
  message: Joi.string()
    .required()
    .trim(),
  isRead: Joi.boolean()
    .default(false),
  relatedItem: Joi.string()
    .custom(isValidObjectId, 'valid MongoDB id')
    .when('type', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  itemModel: Joi.string()
    .valid('Order', 'Books', 'Review')
    .when('relatedItem', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
});

export const updateNotificationSchema = Joi.object({
  isRead: Joi.boolean().required()
});
