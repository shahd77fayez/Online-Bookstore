import Joi from 'joi';
import mongoose from 'mongoose';

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const reviewValidation = {
  createReview: Joi.object({
    book: Joi.string().custom(validateObjectId, 'validate ObjectId').required().messages({
      'any.invalid': 'Invalid book ID format',
      'any.required': 'Book ID is required'
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
    review: Joi.string().trim().max(500).required().messages({
      'string.empty': 'Review text cannot be empty',
      'string.max': 'Review text cannot exceed 500 characters',
      'any.required': 'Review text is required'
    })
  }),

  updateReview: Joi.object({
    rating: Joi.number().min(1).max(5).messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    }),
    review: Joi.string().trim().max(500).messages({
      'string.empty': 'Review text cannot be empty',
      'string.max': 'Review text cannot exceed 500 characters'
    })
  }).min(1).messages({
    'object.min': 'At least one field (rating or review) must be provided for update'
  })
};

export {reviewValidation};
