import express from "express";
import { validateRequest } from "../middlewares/ValidateRequest.js";
import { orderSchema } from "../middlewares/OrderValidation.js";
import { placeOrder, getOrderHistory } from "../controllers/order.controller.js";
import { auth } from "../middlewares/auth.js";  
const router = express.Router();
router.route("/")
  .post(auth(),validateRequest(orderSchema), placeOrder)  
  .get(auth(), getOrderHistory);  

export default router; 
