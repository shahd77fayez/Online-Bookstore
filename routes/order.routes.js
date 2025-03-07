import express from "express";
import { placeOrder, getOrderHistory, updateOrderStatus } from "../controllers/order.controller.js";
import { validateRequest } from "../middlewares/ValidateRequest.js";
import { orderSchema } from "../validation/orderValidation.js";  // Adjusted casing
import { auth } from "../middlewares/auth.js";  
import { checkRole } from "../middlewares/roleCheck.js"; // Role-based check (admin)


const router = express.Router();

router.route("/")
  .post(auth(), validateRequest(orderSchema), placeOrder)  
  .get(auth(), getOrderHistory);  

router.route("/:orderId/status")
  .patch(auth(), checkRole('Admin'), updateOrderStatus);
export default router; // Correct export here
