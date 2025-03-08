import {ErrorClass} from './ErrorClass.js';

export const asyncHandler = (func) => {
  return (req, res, next) => {
    return func(req, res, next)
      .catch((error) => {
        return next(new ErrorClass(error.message, error.status || 500));
      }
      );
  };
};

export const globalErrorHandling = (error, req, res, _next) => {
  return res.status(error.status || 500).json({
    msgError: error.message, // Fix: Use message instead of msg
    status: error.status
  });
};
