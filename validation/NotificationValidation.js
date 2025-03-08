import Joi from 'joi';
import {Types} from 'mongoose';

const isValidObjectId = (value, helpers) => {
  if (!value) return value;
  // Convert ObjectId to string if it's a MongoDB ObjectId
  const stringValue = value.toString();
  if (!Types.ObjectId.isValid(stringValue)) {
    return helpers.error('any.invalid');
  }
  return stringValue;
};

export const createNotificationSchema = Joi.object({
  recipients: Joi.array().items(
    Joi.any().custom(isValidObjectId, 'valid MongoDB id')
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
  relatedItem: Joi.any()
    .custom(isValidObjectId, 'valid MongoDB id')
    .when('type', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  itemModel: Joi.string()
    .valid('Order', 'Books', 'User', 'Review')
    .when('relatedItem', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
});

export const updateNotificationSchema = Joi.object({
  isRead: Joi.boolean().required()
});
