// middlewares/ValidateRequest.js
import { orderSchema } from "../validation/orderValidation.js";
import Joi from "joi";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};
