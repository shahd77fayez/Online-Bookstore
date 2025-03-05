const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); 
import { validateRequest } from "../middlewares/ValidateRequest.js";
import { orderSchema } from "../middlewares/OrderValidation.js";


router.route('/')
  .post( validateRequest(orderSchema),orderController.placeOrder)
  .get(orderController.getOrderHistory); 

module.exports = router;
