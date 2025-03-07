// paymentRoutes.js
import express from 'express';
import { createPaymentIntent } from '../controllers/payment.controller.js';  // Import the controller method
const router = express.Router();
import { checkRole } from "../middlewares/roleCheck.js"; // Role-based check (admin)
router.post('/',checkRole('Admin'), createPaymentIntent);
export default router; // Use export default
