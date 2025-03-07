// paymentRoutes.js
import express from 'express';
import { createPaymentIntent } from '../controllers/payment.controller.js';  // Import the controller method
const router = express.Router();
router.post('/',isAdmin, createPaymentIntent);
export default router; // Use export default
