import express from "express";
import { placeOrder, getOrderHistory } from "../controllers/order.controller.js";
import { validateRequest } from "../middlewares/ValidateRequest.js";
import { orderSchema } from "../middlewares/OrderValidation.js";

const orderRouter = express.Router();

orderRouter.route("/")
  .post(validateRequest(orderSchema), placeOrder)
  .get(getOrderHistory);

export default orderRouter;