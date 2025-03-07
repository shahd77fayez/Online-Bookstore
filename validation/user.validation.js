import joiDate from '@joi/date';
import Joi from 'joi';
import {generalFields} from '../middlewares/validation.js';

const joi = Joi.extend(joiDate);

// Sign Up Validation
export const signUpVal
    = Joi.object({
      firstName: Joi.string().min(2).max(30).required(),
      lastName: Joi.string().min(2).max(30).required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(50).required(),
      phone: Joi.string().pattern(/^\d{10,15}$/).required(),
      dob: Joi.date().iso().required()
    });

// Confirm Email Validation
export const confirmEmailVal = {
  body: joi.object().required().keys({
    email: generalFields.email,
    code: joi.string().length(6).messages({
      'string.length': 'Code must be exactly 6 characters.'
    })
  })
};

// Sign In Validation
export const signInVal = {
  body: joi.object().required().keys({
    email: generalFields.email,
    password: generalFields.password
  })
};

// Send Verification Code Validation
export const sendCodeVal = {
  body: joi.object().required().keys({
    email: generalFields.email
  })
};

// Reset Password Validation
export const resetPasswordVal = {
  body: joi.object().required().keys({
    email: generalFields.email,
    password: generalFields.password,
    code: joi.string().length(6).messages({
      'string.length': 'Code must be exactly 6 characters.'
    })
  })
};

// Update User Validation (Allows Partial Updates)
export const updateUserVal = {
  body: joi.object().required().keys({
    userName: generalFields.name.optional(),
    email: generalFields.email.optional(),
    password: generalFields.password.optional(),
    phone: joi.string().regex(/^\d{11}$/).optional().messages({
      'string.pattern.base': 'Phone number must be 11 digits.'
    }),
    DoB: joi.date().format('YYYY-MM-DD').optional().messages({
      'date.format': 'Date of Birth must be in YYYY-MM-DD format.'
    })
  })
};

// Logout Validation (Checks Bearer Token in Headers)
export const logoutVal = {
  headers: joi.object().required().keys({
    authorization: joi
      .string()
      .pattern(/^(Bearer\s)?[\w-]+\.[\w-]+\.[\w-]+$/) // "Bearer " is now optional
      .required()
      .messages({
        'string.pattern.base': 'Invalid authorization token format.',
        'any.required': 'Authorization header is required.'
      })
  }).unknown(true) // Allows additional headers
};

// Change Password Validation
export const changePasswordVal = {
  body: joi.object().required().keys({
    oldpass: generalFields.password,
    newpass: generalFields.password
  })
};

// Delete User Validation
export const deleteUserVal = {
  headers: joi.object().keys({
    authorization: joi
      .string()
      .pattern(/^(Bearer\s)?[\w-]+\.[\w-]+\.[\w-]+$/) // "Bearer " is now optional
      .required()
      .messages({
        'string.pattern.base': 'Invalid authorization token format.',
        'any.required': 'Authorization header is required.'
      })
  }).unknown(true) // Allows additional headers
};
