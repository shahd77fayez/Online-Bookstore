// paymentRoutes.js
import express from 'express';
import {createPaymentIntent} from '../controllers/payment.controller.js';
import {checkRole} from '../middlewares/roleCheck.js';
import {auth, roles} from '../middlewares/auth.js';
import {authorize} from '../middlewares/authorize.js';
import {asyncHandler} from '../middlewares/ErrorHandling.js';
// Import the controller method
const router = express.Router(); // Role-based check (admin)
router.post('/', auth(),authorize(roles.admin), asyncHandler(createPaymentIntent));
export default router; // Use export default
