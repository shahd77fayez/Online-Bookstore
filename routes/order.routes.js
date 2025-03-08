import express from 'express';
import {getOrderHistory, placeOrder, updateOrderStatus} from '../controllers/order.controller.js';
import {checkRole} from '../middlewares/roleCheck.js'; // Role-based check (admin)
import {validateRequest} from '../middlewares/ValidateRequest.js';
import {orderSchema} from '../validation/OrderValidation.js'; // Adjusted casing
import {asyncHandler} from '../middlewares/ErrorHandling.js';
import {auth, roles} from '../middlewares/auth.js';
import {authorize} from '../middlewares/authorize.js';

const router = express.Router();

router.route('/')
  .post(auth(), validateRequest(orderSchema), placeOrder)
  .get(auth(), asyncHandler(getOrderHistory));

router.route('/:orderId/status')
  .patch(auth(), authorize(roles.admin), asyncHandler(updateOrderStatus));
export default router; // Correct export here
